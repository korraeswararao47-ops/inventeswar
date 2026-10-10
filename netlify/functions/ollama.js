// Netlify Function: forwards chat requests to Ollama Cloud and adds the API key
// from the OLLAMA_API_KEY environment variable (set in the Netlify dashboard).
// The browser never sees the key. Reached via the redirect in netlify.toml.
const MAX_BODY_BYTES = 200 * 1024;

const reply = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: typeof obj === "string" ? obj : JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Method not allowed" });

  const key = process.env.OLLAMA_API_KEY;
  if (!key) return reply(500, { error: "OLLAMA_API_KEY is not set in the Netlify environment variables." });

  if ((event.body || "").length > MAX_BODY_BYTES) return reply(413, { error: "Request too large" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }
  if (!Array.isArray(payload.messages)) return reply(400, { error: "messages is required" });

  try {
    const res = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || payload.model || "gpt-oss:120b",
        messages: payload.messages,
        stream: false,
      }),
    });
    return reply(res.status, await res.text());
  } catch (e) {
    return reply(502, { error: "Could not reach Ollama: " + e.message });
  }
};
