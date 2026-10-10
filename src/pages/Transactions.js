import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { listUsers } from "../services/auth";

export default function Transactions() {
  const { products, transactions, stockMove } = useInventory();
  const [form, setForm] = useState({ productId: "", type: "IN", quantity: 1 });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const users = listUsers();

  const nameOf = (id) => products.find((p) => p.id === id)?.name || "Deleted product";
  const userOf = (id) => users.find((u) => u.id === id)?.fullName || "Unknown";

  function handleSubmit(e) {
    e.preventDefault();
    setError(""); setOk("");
    try {
      if (!form.productId) throw new Error("Choose a product.");
      stockMove(form.productId, form.type, Number(form.quantity));
      setOk("Transaction recorded.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h2>Transactions</h2>
      <form className="panel inline-form" onSubmit={handleSubmit}>
        <label>Product
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select a product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>)}
          </select>
        </label>
        <label>Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="IN">Stock in</option>
            <option value="OUT">Stock out</option>
          </select>
        </label>
        <label>Quantity
          <input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        </label>
        <button className="btn">Record</button>
        {error && <p className="error full">{error}</p>}
        {ok && <p className="notice full">{ok}</p>}
      </form>

      <section className="panel">
        <h3>History</h3>
        {transactions.length === 0 ? <p className="empty">No transactions yet. Record your first stock movement above.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th className="num">Qty</th><th>By</th></tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{nameOf(t.productId)}</td>
                  <td><span className={`badge ${t.type === "IN" ? "ok" : "warn"}`}>{t.type === "IN" ? "Stock in" : "Stock out"}</span></td>
                  <td className="num">{t.quantity}</td>
                  <td>{userOf(t.createdBy)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </>
  );
}
