import { load, save } from "./storage";

async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const publicUser = ({ passwordHash, ...rest }) => rest;

export async function signup(fullName, email, password) {
  fullName = fullName.trim();
  email = email.trim().toLowerCase();
  if (!fullName) throw new Error("Enter your full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");

  const users = load("users");
  if (users.some((u) => u.email === email)) throw new Error("That email is already registered.");

  const user = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash: await hashPassword(email, password),
    role: users.length === 0 ? "admin" : "staff", // first account is the administrator
  };
  if (!save("users", [...users, user])) throw new Error("Could not save the account: storage is full.");
  return publicUser(user);
}

export async function login(email, password) {
  email = email.trim().toLowerCase();
  const user = load("users").find((u) => u.email === email);
  if (!user || user.passwordHash !== (await hashPassword(email, password))) {
    throw new Error("Email or password is incorrect.");
  }
  return publicUser(user);
}

export function getUserById(id) {
  const u = load("users").find((x) => x.id === id);
  return u ? publicUser(u) : null;
}

export function listUsers() {
  return load("users").map(publicUser);
}
