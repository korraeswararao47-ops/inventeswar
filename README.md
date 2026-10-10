# Smart Inventory System & Stock Management

Plain React (Create React App / react-scripts, no Vite) + browser localStorage + Ollama Cloud assistant.

## Run it

1. Install Node.js 18 or newer.
2. Open `.env` and set your key:
   ```
   OLLAMA_API_KEY=your_real_key
   REACT_APP_OLLAMA_MODEL=gpt-oss:120b
   ```
3. Start (dependencies install automatically the first time):
   ```
   npm start
   ```
4. Open http://localhost:3000 and sign up. The first account is the administrator; later accounts are staff (staff cannot delete products).

Restart `npm start` after any change to `.env`.

## How the API key is protected

`OLLAMA_API_KEY` has no `REACT_APP_` prefix, so Create React App does not bundle it into the browser code.
The browser calls `/ollama/api/chat`; `src/setupProxy.js` (dev server) forwards it to `https://ollama.com/api/chat`
and adds the `Authorization: Bearer ...` header. This also avoids CORS problems.

`npm run build` produces static files with no proxy. For a public deployment, put a small server in front that
forwards `/ollama/*` to Ollama and adds the key, or the assistant will not work.
Never rename the variable to `REACT_APP_OLLAMA_API_KEY`: that would embed the key in the public JavaScript.

## Structure

```
src/
  components/  Navbar, StatCard, ProductForm, ProductTable
  pages/       Login, Dashboard, Products, LowStock, Transactions, Reports, Assistant
  services/    storage.js, auth.js, inventory.js, ollama.js
  context/     InventoryContext.js
  setupProxy.js
```

## Notes

- Data lives in this browser only (localStorage). Use Reports > Export JSON to back up.
- Passwords are SHA-256 hashed (Web Crypto). The login is a convenience, not real security.
- Check the model name against your Ollama account if the assistant returns an error.

## Deploying to Netlify

The chat needs the included serverless function (`netlify/functions/ollama.js`), so deploy from Git or the Netlify CLI.
Dragging the `build` folder onto Netlify will NOT work, because functions are not uploaded that way.

1. Push the project to GitHub (`.env` is git-ignored, so your key is not uploaded) and import it in Netlify.
   Build settings are read from `netlify.toml`.
2. In Netlify: Site configuration > Environment variables, add:
   - `OLLAMA_API_KEY` = your key
   - `REACT_APP_OLLAMA_MODEL` = e.g. `gpt-oss:120b` (also used by the function if you set `OLLAMA_MODEL`)
3. Trigger a new deploy.

Anyone who finds your site's `/ollama/api/chat` URL can use it, and therefore your Ollama quota. The app login is
client-side only. Keep the site private or set usage limits on your Ollama key.
