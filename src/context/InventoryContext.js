import React, { createContext, useContext, useState, useCallback } from "react";
import { load, save, loadSession, saveSession } from "../services/storage";
import * as auth from "../services/auth";
import { recordStockMove, validateProduct } from "../services/inventory";

const Ctx = createContext(null);
export const useInventory = () => useContext(Ctx);

function persist(key, value) {
  if (!save(key, value)) throw new Error("Storage is full. Export a backup and free up space.");
}

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState(() => load("products"));
  const [transactions, setTransactions] = useState(() => load("transactions"));
  const [user, setUser] = useState(() => {
    const id = loadSession();
    return id ? auth.getUserById(id) : null;
  });

  const isAdmin = user?.role === "admin";

  const signup = useCallback(async (fullName, email, password) => {
    const u = await auth.signup(fullName, email, password);
    saveSession(u.id);
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await auth.login(email, password);
    saveSession(u.id);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const addProduct = useCallback((data) => {
    const clean = validateProduct(data, products);
    const product = { id: crypto.randomUUID(), ...clean, createdAt: new Date().toISOString() };
    const next = [product, ...products];
    persist("products", next);
    setProducts(next);
  }, [products]);

  const updateProduct = useCallback((id, data) => {
    const clean = validateProduct(data, products, id);
    const next = products.map((p) => (p.id === id ? { ...p, ...clean } : p));
    persist("products", next);
    setProducts(next);
  }, [products]);

  const deleteProduct = useCallback((id) => {
    if (!isAdmin) throw new Error("Only administrators can delete products.");
    const next = products.filter((p) => p.id !== id);
    persist("products", next);
    setProducts(next);
  }, [products, isAdmin]);

  const stockMove = useCallback((productId, type, qty) => {
    const result = recordStockMove(productId, type, qty, user.id);
    setProducts(result.products);
    setTransactions(result.transactions);
  }, [user]);

  const exportData = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), products, transactions }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inventory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [products, transactions]);

  const importData = useCallback(async (file) => {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      throw new Error("That file is not valid JSON.");
    }
    if (!Array.isArray(data.products) || !Array.isArray(data.transactions)) {
      throw new Error("Backup file must contain 'products' and 'transactions' lists.");
    }
    const okProduct = (p) => p && p.id && p.name && p.sku && Number.isInteger(p.quantity) && p.quantity >= 0;
    if (!data.products.every(okProduct)) throw new Error("Backup contains invalid product records.");
    persist("products", data.products);
    persist("transactions", data.transactions);
    setProducts(data.products);
    setTransactions(data.transactions);
  }, []);

  const value = {
    user, isAdmin, products, transactions,
    signup, login, logout,
    addProduct, updateProduct, deleteProduct, stockMove,
    exportData, importData,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
