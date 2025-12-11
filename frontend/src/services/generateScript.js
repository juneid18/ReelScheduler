import api from "./api";

const DEFAULT_ERROR =
  "AI service is temporarily unavailable. Please try again in a moment.";

export async function generateScript(prompt, type = "agent") {
  if (!prompt?.trim()) {
    throw new Error("Please provide a prompt to describe your video idea.");
  }

  try {
    const response = await api.post("/ai/generate", {
      prompt,
      type,
    });

    const result = response.data?.result ?? response.data?.output;

    if (!result || typeof result !== "string") {
      throw new Error(DEFAULT_ERROR);
    }

    return result.trim();
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      DEFAULT_ERROR;
    throw new Error(message);
  }
}

