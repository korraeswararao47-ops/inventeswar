import React from "react";
import { useInventory } from "../context/InventoryContext";
import { isLowStock } from "../services/inventory";
import ProductTable from "../components/ProductTable";

export default function LowStock() {
  const { products } = useInventory();
  const low = products.filter(isLowStock).sort((a, b) => a.quantity - a.minStock - (b.quantity - b.minStock));
  return (
    <>
      <h2>Low stock</h2>
      <p className="muted">Products where quantity is at or below the minimum stock level.</p>
      <section className="panel">
        {low.length === 0 ? <p className="empty">Every product is above its minimum level.</p> : <ProductTable products={low} />}
      </section>
    </>
  );
}
