// Dev-server proxy: the browser calls /ollama/api/chat, this file forwards it to
// https://ollama.com and adds the API key from .env. The key never reaches the browser.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/ollama",
    createProxyMiddleware({
      target: "https://ollama.com",
      changeOrigin: true,
      pathRewrite: { "^/ollama": "" },
      onProxyReq: (proxyReq) => {
        const key = process.env.OLLAMA_API_KEY;
        if (key) proxyReq.setHeader("Authorization", `Bearer ${key}`);
      },
    })
  );
};
