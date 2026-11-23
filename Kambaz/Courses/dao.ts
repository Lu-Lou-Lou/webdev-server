import { v4 as uuid } from "uuid";
import type { Database } from "../http";
import EnrollmentsDao from "../Enrollments/dao";

export type Course = Database["courses"][number];

export default function CoursesDao(db: Database) {
  const enrollments = EnrollmentsDao(db);
  const findAllCourses = () => db.courses;
  const findCourseById = (id: string) => db.courses.find((course) => course._id === id);
  const findCoursesForEnrolledUser = (id: string) => {
    const ids = new Set(enrollments.findEnrollmentsForUser(id).map((entry) => entry.course));
    return db.courses.filter((course) => ids.has(course._id));
  };
  const createCourse = (course: Omit<Course, "_id">, creator: string) => {
    const created = { ...course, _id: uuid() };
    db.courses.push(created);
    enrollments.enrollUserInCourse(creator, created._id);
    return created;
  };
  const updateCourse = (course: Course, updates: Partial<Omit<Course, "_id">>) =>
    Object.assign(course, updates);
  const deleteCourse = (id: string) => {
    db.courses = db.courses.filter((course) => course._id !== id);
    db.enrollments = db.enrollments.filter((entry) => entry.course !== id);
    db.modules = db.modules.filter((item) => item.course !== id);
    db.assignments = db.assignments.filter((item) => item.course !== id);
  };
  return { findAllCourses, findCourseById, findCoursesForEnrolledUser, createCourse, updateCourse, deleteCourse };
}
