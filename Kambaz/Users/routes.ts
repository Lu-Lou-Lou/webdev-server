import type { Express, Request, Response } from "express";
import UsersDao from "./dao";
import type { Credentials, User, UserUpdates } from "./dao";

function readCredentials(body: unknown): Credentials | null {
  if (!body || typeof body !== "object") return null;
  const { username, password } = body as Record<string, unknown>;
  return typeof username === "string" && username.trim() && typeof password === "string" && password
    ? { username: username.trim(), password }
    : null;
}

function publicUser(user: User) {
  const { password: _password, ...profile } = user;
  return profile;
}

const profileFields = ["username", "password", "firstName", "lastName", "email", "dob"] as const;

export default function UserRoutes(app: Express, db: Parameters<typeof UsersDao>[0]) {
  const dao = UsersDao(db);
  const startSession = (req: Request, res: Response, user: User) => {
    req.session.regenerate((error) => {
      if (error) {
        res.status(500).json({ message: "Unable to start the session." });
        return;
      }
      req.session.currentUser = publicUser(user);
      res.json(req.session.currentUser);
    });
  };

  const signin = (req: Request, res: Response) => {
    const credentials = readCredentials(req.body);
    if (!credentials) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }
    const user = dao.findUserByCredentials(credentials.username, credentials.password);
    if (!user) {
      res.status(401).json({ message: "Invalid username or password." });
      return;
    }
    startSession(req, res, user);
  };

  const signup = (req: Request, res: Response) => {
    const credentials = readCredentials(req.body);
    if (!credentials) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }
    if (dao.findUserByUsername(credentials.username)) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    startSession(req, res, dao.createUser(credentials));
  };

  const updateUser = (req: Request<{ userId: string }, unknown, unknown>, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.status(401).json({ message: "Sign in to update your profile." });
      return;
    }
    if (currentUser._id !== userId) {
      res.status(403).json({ message: "You can only update your own profile." });
      return;
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({ message: "Provide a profile object." });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const updates: UserUpdates = {};
    for (const field of profileFields) {
      if (!Object.hasOwn(body, field)) continue;
      const value = body[field];
      if (typeof value !== "string") {
        res.status(400).json({ message: `Invalid ${field}.` });
        return;
      }
      updates[field] = value;
    }
    if (updates.username !== undefined) {
      updates.username = updates.username.trim();
      if (!updates.username) {
        res.status(400).json({ message: "Username is required." });
        return;
      }
      const existing = dao.findUserByUsername(updates.username);
      if (existing && existing._id !== userId) {
        res.status(400).json({ message: "Username already in use" });
        return;
      }
    }
    if (updates.password === "") delete updates.password;
    const user = dao.updateUser(userId, updates);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    req.session.currentUser = publicUser(user);
    res.json(req.session.currentUser);
  };

  app.post("/api/users/signin", signin);
  app.post("/api/users/signup", signup);
  app.get("/api/users/profile", (req, res) => {
    res.set("Cache-Control", "no-store");
    const user = req.session.currentUser;
    if (user) res.json(user);
    else res.status(401).json({ message: "Sign in to view your profile." });
  });
  app.put("/api/users/:userId", updateUser);
  app.post("/api/users/signout", (req, res) => {
    const { httpOnly, sameSite, secure } = req.session.cookie;
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ message: "Unable to sign out." });
        return;
      }
      res.clearCookie("connect.sid", { httpOnly, sameSite, secure: secure === true });
      res.sendStatus(200);
    });
  });
}
