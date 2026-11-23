import "express-session";
import type { User } from "./Users/dao";

declare module "express-session" {
  interface SessionData {
    currentUser?: Omit<User, "password">;
  }
}
