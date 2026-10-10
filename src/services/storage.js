const KEYS = {
  products: "inventory_products",
  transactions: "inventory_transactions",
  users: "inventory_users",
  session: "inventory_session",
};

export function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Storage full or unavailable", e);
    return false;
  }
}

// The login session lives in sessionStorage so it ends when the tab closes.
export function loadSession() {
  try {
    return sessionStorage.getItem(KEYS.session);
  } catch {
    return null;
  }
}

export function saveSession(userId) {
  try {
    if (userId) sessionStorage.setItem(KEYS.session, userId);
    else sessionStorage.removeItem(KEYS.session);
  } catch (e) {
    console.error("Session storage unavailable", e);
  }
}
