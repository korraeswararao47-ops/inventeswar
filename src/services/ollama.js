// Requests go to /ollama/api/chat on the dev server (see src/setupProxy.js),
// which adds the OLLAMA_API_KEY from .env before forwarding to ollama.com.
const ENDPOINT = process.env.REACT_APP_OLLAMA_ENDPOINT || "/ollama/api/chat";
const MODEL = process.env.REACT_APP_OLLAMA_MODEL || "gpt-oss:120b";

export async function askAssistant(question, products, transactions = []) {
  const summary = products.map((p) => ({
    name: p.name,
    sku: p.sku,
    category: p.category,
    qty: p.quantity,
    min: p.minStock,
    price: p.price,
  }));
  const recent = transactions.slice(0, 30).map((t) => ({
    product: products.find((p) => p.id === t.productId)?.name || "deleted product",
    type: t.type,
    qty: t.quantity,
    date: t.createdAt.slice(0, 10),
  }));

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are an inventory assistant. Answer only from the data given. " +
            "A product is low stock when qty <= min. Be concise.",
        },
        {
          role: "user",
          content:
            `Inventory:\n${JSON.stringify(summary)}\n\n` +
            `Recent transactions (newest first):\n${JSON.stringify(recent)}\n\n` +
            `Question: ${question}`,
        },
      ],
    }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Ollama rejected the API key. Check OLLAMA_API_KEY in .env and restart npm start.");
  }
  if (res.status === 404) {
    throw new Error("Assistant endpoint not found (404). On Netlify, deploy with Functions enabled; see README.");
  }
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error || ""; } catch { /* ignore */ }
    throw new Error(`Ollama request failed (${res.status}). ${detail}`.trim());
  }
  const data = await res.json();
  return data.message?.content ?? "";
}
