import { cookies } from "next/headers";
import { verifyToken, type SessionUser } from "./jwt";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}