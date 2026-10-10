import React, { useState } from "react";

const EMPTY = { name: "", sku: "", category: "", quantity: 0, minStock: 5, price: 0 };

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    try {
      onSubmit(form);
      setError("");
      if (!initial) setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit product" : "Add product"}</h3>
      <label>Name<input value={form.name} onChange={set("name")} /></label>
      <label>SKU<input value={form.sku} onChange={set("sku")} /></label>
      <label>Category<input value={form.category} onChange={set("category")} /></label>
      <label>Quantity<input type="number" min="0" step="1" value={form.quantity} onChange={set("quantity")} /></label>
      <label>Minimum stock<input type="number" min="0" step="1" value={form.minStock} onChange={set("minStock")} /></label>
      <label>Price per unit<input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} /></label>
      {error && <p className="error full">{error}</p>}
      <div className="actions full">
        <button className="btn" type="submit">{initial ? "Save changes" : "Add product"}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
