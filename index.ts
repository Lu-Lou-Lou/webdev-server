import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import { randomBytes } from "node:crypto";
import Lab5 from "./Lab5";
import db from "./Kambaz/Database";
import UserRoutes from "./Kambaz/Users/routes";
import CourseRoutes from "./Kambaz/Courses/routes";
import ModuleRoutes from "./Kambaz/Modules/routes";
import AssignmentRoutes from "./Kambaz/Assignments/routes";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes";

const app = express();
const production = (process.env.SERVER_ENV ?? process.env.NODE_ENV) === "production";
const clientOrigin = process.env.CLIENT_URL || "http://localhost:3000";
if (production && (!process.env.SESSION_SECRET || !process.env.CLIENT_URL)) {
  throw new Error("Set both SESSION_SECRET and CLIENT_URL for production.");
}
if (production) app.set("trust proxy", 1);

app.use(cors({
  credentials: true,
  origin: clientOrigin,
}));
app.use("/api", (req, res, next) => {
  const origin = req.get("Origin");
  if (origin && origin !== clientOrigin && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.status(403).json({ message: "Request origin is not allowed." });
    return;
  }
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: production ? "none" : "lax", secure: production },
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to WebDev Server!");
});

Lab5(app);
UserRoutes(app, db);
CourseRoutes(app, db);
ModuleRoutes(app, db);
AssignmentRoutes(app, db);
EnrollmentRoutes(app, db);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
