import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid } from "recharts";
import { useInventory } from "../context/InventoryContext";
import { isLowStock } from "../services/inventory";
import StatCard from "../components/StatCard";
import { money } from "../components/ProductTable";

export default function Dashboard() {
  const { products, transactions } = useInventory();

  const totals = useMemo(() => ({
    units: products.reduce((s, p) => s + p.quantity, 0),
    value: products.reduce((s, p) => s + p.quantity * p.price, 0),
    low: products.filter(isLowStock).length,
  }), [products]);

  const byCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.category] = (map[p.category] || 0) + p.quantity; });
    return Object.entries(map).map(([category, units]) => ({ category, units }));
  }, [products]);

  const trend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), IN: 0, OUT: 0 });
    }
    transactions.forEach((t) => {
      const row = days.find((d) => d.date === t.createdAt.slice(0, 10));
      if (row) row[t.type] += t.quantity;
    });
    return days.map((d) => ({ ...d, date: d.date.slice(5) }));
  }, [transactions]);

  const nameOf = (id) => products.find((p) => p.id === id)?.name || "Deleted product";

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Units in stock" value={totals.units} />
        <StatCard label="Inventory value" value={money(totals.value)} />
        <StatCard label="Low-stock products" value={totals.low} tone={totals.low ? "warn" : ""} />
      </div>

      <div className="grid-2">
        <section className="panel">
          <h3>Units by category</h3>
          {byCategory.length === 0 ? <p className="empty">Add products to see this chart.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" /><YAxis allowDecimals={false} /><Tooltip />
                <Bar dataKey="units" fill="#0f6e8c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
        <section className="panel">
          <h3>Stock movement, last 7 days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="IN" stroke="#2e7d4f" strokeWidth={2} />
              <Line type="monotone" dataKey="OUT" stroke="#b3261e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="panel">
        <h3>Recent transactions</h3>
        {transactions.length === 0 ? <p className="empty">No transactions yet.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th className="num">Qty</th></tr></thead>
            <tbody>
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{nameOf(t.productId)}</td>
                  <td><span className={`badge ${t.type === "IN" ? "ok" : "warn"}`}>{t.type === "IN" ? "Stock in" : "Stock out"}</span></td>
                  <td className="num">{t.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </>
  );
}
