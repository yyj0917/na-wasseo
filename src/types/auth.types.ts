import type { Timestamp } from "firebase-admin/firestore";

export interface Team {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface User {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  loginKey: string; // bcrypt 해시된 값
  role: "user" | "admin";
  createdAt: Timestamp;
}

export interface SessionPayload {
  userId: string;
  userName: string;
  teamId: string;
  teamName: string;
  role: "user" | "admin";
}
