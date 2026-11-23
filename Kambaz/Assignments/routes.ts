import type { Express, Request, Response } from "express";
import AssignmentsDao from "./dao";
import { readChanges, requireFaculty, type Database } from "../http";

const defaults = {
  name: "", description: "", points: 100, dueDate: "", availableFrom: "", availableUntil: "",
  group: "ASSIGNMENTS", displayGradeAs: "Percentage", submissionType: "Online", assignTo: "Everyone",
  textEntry: false, websiteUrl: false, mediaRecordings: false, studentAnnotation: false, fileUpload: false, notes: "",
};

export default function AssignmentRoutes(app: Express, db: Database) {
  const dao = AssignmentsDao(db);
  function findTarget(req: Request<{ assignmentId: string }>, res: Response) {
    const scope = req.query.courseId;
    if (scope !== undefined && (typeof scope !== "string" || !scope)) {
      res.status(400).json({ message: "Provide a single courseId." });
      return;
    }
    const matches = dao.findMatches(req.params.assignmentId, scope);
    if (matches.length > 1) {
      res.status(409).json({ message: "Provide courseId to identify this assignment." });
    } else if (!matches.length) {
      res.status(404).json({ message: "Assignment not found." });
    } else {
      return matches[0];
    }
  }
  app.get("/api/courses/:courseId/assignments", (req, res) => {
    res.json(dao.findAssignmentsForCourse(req.params.courseId));
  });
  app.post("/api/courses/:courseId/assignments", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const { courseId } = req.params;
    if (!db.courses.some((course) => course._id === courseId)) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    const changes = readChanges(req.body, defaults);
    if (!changes?.name) {
      res.status(400).json({ message: "Provide a valid assignment name and fields." });
      return;
    }
    res.json(dao.createAssignment(courseId, { ...defaults, ...changes }));
  });
  app.put("/api/assignments/:assignmentId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const item = findTarget(req, res);
    if (!item) return;
    const changes = readChanges(req.body, defaults);
    if (!changes) {
      res.status(400).json({ message: "Provide valid assignment fields." });
      return;
    }
    res.json(dao.updateAssignment(item, changes));
  });
  app.delete("/api/assignments/:assignmentId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const item = findTarget(req, res);
    if (item) {
      dao.deleteAssignment(item);
      res.sendStatus(200);
    }
  });
}
