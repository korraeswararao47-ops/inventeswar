import React from "react";
import { NavLink } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";

const links = [
  ["/", "Dashboard"],
  ["/products", "Products"],
  ["/low-stock", "Low stock"],
  ["/transactions", "Transactions"],
  ["/reports", "Reports"],
  ["/assistant", "Assistant"],
];

export default function Navbar() {
  const { user, logout } = useInventory();
  return (
    <nav className="nav">
      <div className="brand">Smart Inventory</div>
      <div className="nav-links">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="nav-user">
        <span>{user.fullName}</span>
        <small>{user.role}</small>
        <button className="btn ghost" onClick={logout}>Log out</button>
      </div>
    </nav>
  );
}
