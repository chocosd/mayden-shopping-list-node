import { randomBytes } from "crypto";

export function randomId(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .substring(0, length);
}
