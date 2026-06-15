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
  // Admin login (hardcoded for now)
  if (email === "admin" && password === "Lg123123123") {
    const adminUser: User & { password: string } = {
      id: "admin",
      email: "admin@zishahu.com",
      name: "管理员",
      password: "Lg123123123",
      role: "admin",
      wishlist: [],
      orders: [],
      createdAt: new Date().toISOString(),
    };
    saveUsers([...(getUsers().filter(u => u.email !== "admin@zishahu.com")), adminUser]);
    const { password: _, ...user } = adminUser;
    setCurrentUser(user);
    return { success: true, user };
  }

  const users = getUsers();
  const found = users.find((u) => u.email === email || u.id === "admin");
  if (!found) {
    return { success: false, error: "邮箱未注册 / 电子邮箱未注册" };
  }
  if (found.password !== password) {
    return { success: false, error: "密码错误 / 密码错误" };
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
