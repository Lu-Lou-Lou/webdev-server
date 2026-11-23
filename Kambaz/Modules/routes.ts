import type { Express } from "express";
import ModulesDao from "./dao";
import { readChanges, requireFaculty, type Database } from "../http";

const defaults = { name: "", description: "" };

export default function ModuleRoutes(app: Express, db: Database) {
  const dao = ModulesDao(db);
  app.get("/api/courses/:courseId/modules", (req, res) => {
    res.json(dao.findModulesForCourse(req.params.courseId));
  });
  app.post("/api/courses/:courseId/modules", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const { courseId } = req.params;
    if (!db.courses.some((course) => course._id === courseId)) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    const changes = readChanges(req.body, defaults);
    if (!changes?.name) {
      res.status(400).json({ message: "Provide a valid module name and description." });
      return;
    }
    res.json(dao.createModule(courseId, { ...defaults, ...changes }));
  });
  app.put("/api/modules/:moduleId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const item = dao.findModule(req.params.moduleId);
    if (!item) {
      res.status(404).json({ message: "Module not found." });
      return;
    }
    const changes = readChanges(req.body, defaults);
    if (!changes) {
      res.status(400).json({ message: "Provide valid module fields." });
      return;
    }
    res.json(dao.updateModule(item, changes));
  });
  app.delete("/api/modules/:moduleId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    if (!dao.findModule(req.params.moduleId)) {
      res.status(404).json({ message: "Module not found." });
      return;
    }
    dao.deleteModule(req.params.moduleId);
    res.sendStatus(200);
  });
}
