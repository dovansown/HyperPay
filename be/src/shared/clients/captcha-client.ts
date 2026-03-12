import { env } from "../config/env.js";
import { AppError, ErrorCodes } from "../http/app-error.js";

interface SolveCaptchaPayload {
  image_base64: string;
}

interface SolveCaptchaResult {
  captcha_text: string;
}

function toBase64ImageString(imageBytes: Buffer) {
  return `data:image/png;base64,${imageBytes.toString("base64")}`;
}

export async function solveCaptchaFromBase64(imageBase64: string): Promise<string> {
  const payload: SolveCaptchaPayload = { image_base64: imageBase64 };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.CAPTCHA_SERVICE_TIMEOUT_MS);
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (env.CAPTCHA_SERVICE_API_KEY) {
    headers["x-api-key"] = env.CAPTCHA_SERVICE_API_KEY;
  }

  try {
    const response = await fetch(`${env.CAPTCHA_SERVICE_URL}/solve`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        502,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        "Captcha service returned an error",
        { status: response.status, body: errorText }
      );
    }

    const body = (await response.json()) as SolveCaptchaResult;
    if (!body?.captcha_text) {
      throw new AppError(
        502,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        "Captcha service response is invalid"
      );
    }
    return body.captcha_text;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      502,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      "Cannot connect to captcha service",
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function solveCaptchaFromImageBuffer(imageBytes: Buffer): Promise<string> {
  return solveCaptchaFromBase64(toBase64ImageString(imageBytes));
}
