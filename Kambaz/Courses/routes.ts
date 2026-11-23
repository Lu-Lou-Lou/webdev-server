import type { Express } from "express";
import CoursesDao from "./dao";
import { readChanges, requireFaculty, requireUser, type Database } from "../http";

const defaults = {
  name: "", number: "", description: "", startDate: "", endDate: "",
  department: "", credits: 0, image: "/images/reactjs.jpg",
};

export default function CourseRoutes(app: Express, db: Database) {
  const dao = CoursesDao(db);
  app.get("/api/courses", (_req, res) => res.json(dao.findAllCourses()));
  app.get("/api/courses/:courseId", (req, res) => {
    const course = dao.findCourseById(req.params.courseId);
    if (course) res.json(course);
    else res.status(404).json({ message: "Course not found." });
  });
  app.get("/api/users/:userId/courses", (req, res) => {
    const { userId } = req.params;
    const id = userId === "current" ? requireUser(req, res)?._id : userId;
    if (id) res.json(dao.findCoursesForEnrolledUser(id));
  });
  app.post("/api/users/current/courses", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const changes = readChanges(req.body, defaults);
    if (!changes?.name) {
      res.status(400).json({ message: "Provide a valid course name and course fields." });
      return;
    }
    res.json(dao.createCourse({ ...defaults, ...changes }, req.session.currentUser!._id));
  });
  app.put("/api/courses/:courseId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    const course = dao.findCourseById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    const changes = readChanges(req.body, defaults);
    if (!changes) {
      res.status(400).json({ message: "Provide valid course fields." });
      return;
    }
    res.json(dao.updateCourse(course, changes));
  });
  app.delete("/api/courses/:courseId", (req, res) => {
    if (!requireFaculty(req, res)) return;
    if (!dao.findCourseById(req.params.courseId)) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    dao.deleteCourse(req.params.courseId);
    res.sendStatus(200);
  });
}
