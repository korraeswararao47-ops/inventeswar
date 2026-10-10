import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { askAssistant } from "../services/ollama";

const SUGGESTIONS = [
  "Which products need restocking?",
  "Summarize my inventory in three sentences.",
  "Which products moved the most recently?",
];

export default function Assistant() {
  const { products, transactions } = useInventory();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q) {
    if (!q.trim()) return;
    setLoading(true); setError(""); setAnswer("");
    try {
      setAnswer(await askAssistant(q, products, transactions));
    } catch (e) {
      setError(e.message || "The assistant is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Assistant</h2>
      <p className="muted">Ask about your stock in plain language. The assistant only reads a summary of your inventory; it cannot change anything.</p>
      <section className="panel">
        <div className="chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => { setQuestion(s); ask(s); }}>{s}</button>
          ))}
        </div>
        <form className="ask" onSubmit={(e) => { e.preventDefault(); ask(question); }}>
          <input placeholder="Ask a question about your inventory" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button className="btn" disabled={loading}>{loading ? "Thinking" : "Ask"}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {answer && <div className="answer">{answer}</div>}
      </section>
    </>
  );
}
