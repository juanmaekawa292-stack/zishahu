import { User } from "@/types";

const USERS_KEY = "zisha-users";
const CURRENT_USER_KEY = "zisha-current-user";

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export function getUsers(): (User & { password: string })[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: (User & { password: string })[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(name: string, email: string, password: string): AuthResult {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "该邮箱已被注册 / 此電子郵件已被註冊" };
  }
  if (password.length < 6) {
    return { success: false, error: "密码至少6位 / 密碼至少6位" };
  }
  const newUser: User & { password: string } = {
    id: "user_" + Date.now(),
    email,
    name,
    password,
    wishlist: [],
    orders: [],
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  const { password: _, ...user } = newUser;
  setCurrentUser(user);
  return { success: true, user };
}

export function login(email: string, password: string): AuthResult {
  const users = getUsers();
  const found = users.find((u) => u.email === email);
  if (!found) {
    return { success: false, error: "邮箱未注册 / 電子郵件未註冊" };
  }
  if (found.password !== password) {
    return { success: false, error: "密码错误 / 密碼錯誤" };
  }
  const { password: _, ...user } = found;
  setCurrentUser(user);
  return { success: true, user };
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
