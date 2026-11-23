import type { Request, Response } from "express";
import type db from "./Database";

export type Database = typeof db;

export function requireUser(req: Request, res: Response) {
  const user = req.session.currentUser;
  if (!user) res.status(401).json({ message: "Sign in to continue." });
  return user;
}

export function requireFaculty(req: Request, res: Response) {
  const user = requireUser(req, res);
  if (!user) return false;
  if (user.role === "FACULTY" || user.role === "ADMIN") return true;
  res.status(403).json({ message: "Faculty access is required." });
  return false;
}

export function readChanges<T extends Record<string, string | number | boolean>>(
  body: unknown,
  defaults: T,
): Partial<T> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const changes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "_id" || key === "course") continue;
    if (!Object.hasOwn(defaults, key) || typeof value !== typeof defaults[key]) return null;
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) return null;
    if (key === "name" && typeof value === "string" && !value.trim()) return null;
    changes[key] = value;
  }
  return Object.keys(changes).length ? changes as Partial<T> : null;
}
