import { load, save } from "./storage";

export function isLowStock(p) {
  return p.quantity <= p.minStock;
}

export function validateProduct(data, products, editingId = null) {
  const name = String(data.name || "").trim();
  const sku = String(data.sku || "").trim();
  const category = String(data.category || "").trim();
  const quantity = Number(data.quantity);
  const minStock = Number(data.minStock);
  const price = Number(data.price);

  if (!name) throw new Error("Product name is required.");
  if (!sku) throw new Error("SKU is required.");
  if (!category) throw new Error("Category is required.");
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Quantity must be a whole number, 0 or more.");
  if (!Number.isInteger(minStock) || minStock < 0) throw new Error("Minimum stock must be a whole number, 0 or more.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Price must be 0 or more.");
  if (products.some((p) => p.id !== editingId && p.sku.toLowerCase() === sku.toLowerCase())) {
    throw new Error(`SKU "${sku}" is already used by another product.`);
  }
  return { name, sku, category, quantity, minStock, price };
}

export function recordStockMove(productId, type, qty, userId) {
  const products = load("products");
  const transactions = load("transactions");
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");
  if (!Number.isInteger(qty) || qty <= 0) throw new Error("Quantity must be a whole number greater than 0.");
  if (type === "OUT" && product.quantity < qty) {
    throw new Error(`Insufficient stock: only ${product.quantity} available.`);
  }

  const updatedProducts = products.map((p) =>
    p.id === productId ? { ...p, quantity: p.quantity + (type === "IN" ? qty : -qty) } : p
  );
  const tx = {
    id: crypto.randomUUID(),
    productId,
    type,
    quantity: qty,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  };
  const nextTx = [tx, ...transactions];

  if (!save("products", updatedProducts) || !save("transactions", nextTx)) {
    throw new Error("Storage is full. Export a backup and free up space.");
  }
  return { products: updatedProducts, transactions: nextTx };
}
