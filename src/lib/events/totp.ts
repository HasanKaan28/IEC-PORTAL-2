import crypto from "crypto";

/**
 * 60-Second Rotating Dynamic TOTP Algorithm for Event QR Attendance
 * Prevents attendance fraud by rotating every 60 seconds.
 */

export interface TOTPResult {
  code: string;
  payload: string;
  remainingSeconds: number;
  currentWindow: number;
}

const ROTATION_WINDOW_SECONDS = 60;

/**
 * Generates the current 6-digit TOTP code and signed payload for an event
 */
export function generateEventTOTP(
  eventId: string,
  secret: string,
  nowMs: number = Date.now()
): TOTPResult {
  const currentWindow = Math.floor(nowMs / (ROTATION_WINDOW_SECONDS * 1000));
  const remainingSeconds =
    ROTATION_WINDOW_SECONDS - (Math.floor(nowMs / 1000) % ROTATION_WINDOW_SECONDS);

  // Compute HMAC SHA-256
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${eventId}:${currentWindow}`);
  const hash = hmac.digest("hex");

  // Derive a 6-digit integer from the hash
  const offset = parseInt(hash.substring(hash.length - 1), 16);
  const binary =
    ((parseInt(hash.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff) %
      1000000)
      .toString()
      .padStart(6, "0");

  const payload = `${eventId}.${binary}.${currentWindow}`;

  return {
    code: binary,
    payload,
    remainingSeconds,
    currentWindow,
  };
}

/**
 * Verifies a 6-digit code or scanned QR payload against the current and previous 60s window
 */
export function verifyEventTOTP(
  eventId: string,
  secret: string,
  inputCodeOrPayload: string,
  nowMs: number = Date.now()
): boolean {
  if (!inputCodeOrPayload) return false;

  const currentWindow = Math.floor(nowMs / (ROTATION_WINDOW_SECONDS * 1000));
  const cleanInput = inputCodeOrPayload.trim();

  // Extract numeric code if raw payload was passed (e.g. "eventId.123456.window")
  let codeToTest = cleanInput;
  if (cleanInput.includes(".")) {
    const parts = cleanInput.split(".");
    if (parts.length >= 2 && parts[0] === eventId) {
      codeToTest = parts[1];
    }
  }

  // Remove any spaces (e.g. "482 913" -> "482913")
  codeToTest = codeToTest.replace(/\s+/g, "");

  // Check current window and previous window (grace period for network latency / transition)
  for (const windowOffset of [0, -1]) {
    const targetWindow = currentWindow + windowOffset;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${eventId}:${targetWindow}`);
    const hash = hmac.digest("hex");

    const offset = parseInt(hash.substring(hash.length - 1), 16);
    const expectedCode =
      ((parseInt(hash.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff) %
        1000000)
        .toString()
        .padStart(6, "0");

    if (codeToTest === expectedCode) {
      return true;
    }
  }

  return false;
}
