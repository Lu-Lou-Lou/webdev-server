import { v4 as uuid } from "uuid";
import type { Database } from "../http";

type Assignment = Database["assignments"][number];
type Fields = Omit<Assignment, "_id" | "course">;

export default function AssignmentsDao(db: Database) {
  const findAssignmentsForCourse = (id: string) => db.assignments.filter((item) => item.course === id);
  const findMatches = (id: string, course?: string) =>
    db.assignments.filter((item) => item._id === id && (!course || item.course === course));
  const createAssignment = (course: string, fields: Fields) => {
    const created = { ...fields, course, _id: uuid() };
    db.assignments.push(created);
    return created;
  };
  const updateAssignment = (item: Assignment, changes: Partial<Fields>) => Object.assign(item, changes);
  const deleteAssignment = (assignment: Assignment) => {
    db.assignments = db.assignments.filter((item) => item !== assignment);
  };
  return { findAssignmentsForCourse, findMatches, createAssignment, updateAssignment, deleteAssignment };
}
