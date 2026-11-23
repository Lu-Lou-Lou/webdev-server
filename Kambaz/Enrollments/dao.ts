import { v4 as uuid } from "uuid";
import type { Database } from "../http";

export default function EnrollmentsDao(db: Database) {
  const findEnrollmentsForUser = (user: string) => db.enrollments.filter((entry) => entry.user === user);
  const enrollUserInCourse = (user: string, course: string) => {
    const existing = db.enrollments.find((entry) => entry.user === user && entry.course === course);
    if (existing) return existing;
    const entry = { _id: uuid(), user, course };
    db.enrollments.push(entry);
    return entry;
  };
  const unenrollUserFromCourse = (user: string, course: string) => {
    db.enrollments = db.enrollments.filter((entry) => entry.user !== user || entry.course !== course);
  };
  return { findEnrollmentsForUser, enrollUserInCourse, unenrollUserFromCourse };
}
