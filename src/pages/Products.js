import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, isAdmin } = useInventory();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));

  function handleDelete(p) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { deleteProduct(p.id); setMessage(`Deleted ${p.name}.`); }
    catch (e) { setMessage(e.message); }
  }

  return (
    <>
      <div className="page-head">
        <h2>Products</h2>
        <button className="btn" onClick={() => { setEditing(null); setShowForm(!showForm); }}>
          {showForm ? "Close form" : "Add product"}
        </button>
      </div>

      {showForm && !editing && (
        <ProductForm onSubmit={(d) => { addProduct(d); setMessage("Product added."); }} />
      )}
      {editing && (
        <ProductForm
          key={editing.id}
          initial={editing}
          onSubmit={(d) => { updateProduct(editing.id, d); setEditing(null); setMessage("Product updated."); }}
          onCancel={() => setEditing(null)}
        />
      )}
      {message && <p className="notice">{message}</p>}

      <input className="search" placeholder="Search by name or SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
      <section className="panel">
        <ProductTable products={filtered} onEdit={(p) => { setShowForm(false); setEditing(p); }} onDelete={handleDelete} canDelete={isAdmin} />
      </section>
    </>
  );
}
