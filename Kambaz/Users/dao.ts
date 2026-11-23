import { v4 as uuidv4 } from "uuid";
import type db from "../Database";

export type User = (typeof db.users)[number] & { dob?: string };
export type Credentials = Pick<User, "username" | "password">;
export type UserUpdates = Partial<Pick<User, "username" | "password" | "firstName" | "lastName" | "email" | "role" | "dob">>;

export default function UsersDao({ users }: { users: User[] }) {
  const findUserById = (id: string) => users.find((user) => user._id === id);
  const findUserByUsername = (username: string) => users.find((user) => user.username === username);
  const findUserByCredentials = (username: string, password: string) =>
    users.find((user) => user.username === username && user.password === password);

  const createUser = (credentials: Credentials): User => {
    const user = {
      ...credentials,
      _id: uuidv4(),
      firstName: "", lastName: "", email: "", role: "STUDENT", loginId: "",
      section: "", lastActivity: "", totalActivity: "",
    };
    users.push(user);
    return user;
  };

  const updateUser = (id: string, updates: UserUpdates) => {
    const user = findUserById(id);
    if (user) Object.assign(user, updates);
    return user;
  };

  return { findUserById, findUserByUsername, findUserByCredentials, createUser, updateUser };
}
