import React, { useRef, useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { isLowStock } from "../services/inventory";
import StatCard from "../components/StatCard";
import { money } from "../components/ProductTable";

export default function Reports() {
  const { products, transactions, exportData, importData } = useInventory();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState({ text: "", error: false });

  const rows = Object.values(
    products.reduce((acc, p) => {
      const r = (acc[p.category] ||= { category: p.category, products: 0, units: 0, value: 0, low: 0 });
      r.products += 1; r.units += p.quantity; r.value += p.quantity * p.price; if (isLowStock(p)) r.low += 1;
      return acc;
    }, {})
  );
  const totalIn = transactions.filter((t) => t.type === "IN").reduce((s, t) => s + t.quantity, 0);
  const totalOut = transactions.filter((t) => t.type === "OUT").reduce((s, t) => s + t.quantity, 0);

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm("Importing replaces all current products and transactions. Continue?")) { e.target.value = ""; return; }
    try { await importData(file); setMsg({ text: "Backup restored.", error: false }); }
    catch (err) { setMsg({ text: err.message, error: true }); }
    e.target.value = "";
  }

  return (
    <>
      <h2>Reports</h2>
      <div className="stats">
        <StatCard label="Total inventory value" value={money(products.reduce((s, p) => s + p.quantity * p.price, 0))} />
        <StatCard label="Units received" value={totalIn} />
        <StatCard label="Units issued" value={totalOut} />
        <StatCard label="Transactions" value={transactions.length} />
      </div>

      <section className="panel">
        <h3>Summary by category</h3>
        {rows.length === 0 ? <p className="empty">No products yet.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Category</th><th className="num">Products</th><th className="num">Units</th><th className="num">Value</th><th className="num">Low stock</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.category}><td>{r.category}</td><td className="num">{r.products}</td><td className="num">{r.units}</td><td className="num">{money(r.value)}</td><td className="num">{r.low}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="panel">
        <h3>Backup</h3>
        <p className="muted">Data lives only in this browser. Export a JSON backup regularly.</p>
        <div className="actions">
          <button className="btn" onClick={exportData}>Export JSON</button>
          <button className="btn ghost" onClick={() => fileRef.current.click()}>Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        </div>
        {msg.text && <p className={msg.error ? "error" : "notice"}>{msg.text}</p>}
      </section>
    </>
  );
}
