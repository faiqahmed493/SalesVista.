import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.JWT_SECRET;

if (!secretValue) {
  throw new Error("JWT_SECRET is missing from the server environment.");
}

const secret = new TextEncoder().encode(secretValue);
const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || typeof payload.name !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}