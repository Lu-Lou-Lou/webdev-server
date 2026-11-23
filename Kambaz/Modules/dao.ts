import { v4 as uuid } from "uuid";
import type { Database } from "../http";

type CourseModule = Database["modules"][number];
type Fields = Pick<CourseModule, "name" | "description">;

export default function ModulesDao(db: Database) {
  const findModulesForCourse = (id: string) => db.modules.filter((item) => item.course === id);
  const findModule = (id: string) => db.modules.find((item) => item._id === id);
  const createModule = (course: string, fields: Fields) => {
    const created = { ...fields, _id: uuid(), course, lessons: [] };
    db.modules.push(created);
    return created;
  };
  const updateModule = (item: CourseModule, changes: Partial<Fields>) => Object.assign(item, changes);
  const deleteModule = (id: string) => {
    db.modules = db.modules.filter((item) => item._id !== id);
  };
  return { findModulesForCourse, findModule, createModule, updateModule, deleteModule };
}
