import React from "react";
import { isLowStock } from "../services/inventory";

export const money = (n) => Number(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function ProductTable({ products, onEdit, onDelete, canDelete }) {
  if (products.length === 0) return <p className="empty">No products to show.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>SKU</th><th>Category</th>
            <th className="num">Qty</th><th className="num">Min</th><th className="num">Price</th>
            <th>Status</th>{(onEdit || onDelete) && <th></th>}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td className="num">{p.quantity}</td>
              <td className="num">{p.minStock}</td>
              <td className="num">{money(p.price)}</td>
              <td>{isLowStock(p) ? <span className="badge warn">Low stock</span> : <span className="badge ok">In stock</span>}</td>
              {(onEdit || onDelete) && (
                <td className="row-actions">
                  {onEdit && <button className="btn small ghost" onClick={() => onEdit(p)}>Edit</button>}
                  {onDelete && canDelete && <button className="btn small danger" onClick={() => onDelete(p)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
