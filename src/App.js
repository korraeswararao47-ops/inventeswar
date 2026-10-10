import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useInventory } from "./context/InventoryContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import LowStock from "./pages/LowStock";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Assistant from "./pages/Assistant";

export default function App() {
  const { user } = useInventory();
  if (!user) return <Login />;

  return (
    <div className="shell">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/low-stock" element={<LowStock />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
