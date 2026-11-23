import type { Express, Request, Response } from "express";
import EnrollmentsDao from "./dao";
import { requireUser, type Database } from "../http";

export default function EnrollmentRoutes(app: Express, db: Database) {
  const dao = EnrollmentsDao(db);
  function target(req: Request<{ uid: string; cid: string }>, res: Response) {
    const user = requireUser(req, res);
    if (!user) return;
    const { uid, cid } = req.params;
    if (uid !== "current" && uid !== user._id) {
      res.status(403).json({ message: "You can only change your own enrollments." });
      return;
    }
    if (!db.courses.some((course) => course._id === cid)) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    return { user: user._id, course: cid };
  }

  app.post("/api/users/:uid/courses/:cid", (req, res) => {
    const entry = target(req, res);
    if (entry) res.json(dao.enrollUserInCourse(entry.user, entry.course));
  });
  app.delete("/api/users/:uid/courses/:cid", (req, res) => {
    const entry = target(req, res);
    if (entry) {
      dao.unenrollUserFromCourse(entry.user, entry.course);
      res.sendStatus(200);
    }
  });
}
