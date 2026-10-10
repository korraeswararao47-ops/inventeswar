import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { InventoryProvider } from "./context/InventoryContext";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <InventoryProvider>
      <App />
    </InventoryProvider>
  </BrowserRouter>
);
