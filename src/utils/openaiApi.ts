import { Prompt } from "../types";
import { CategoryResult, CategorySuggestion } from "../types/api";

const OPENAI_API_URL = "https://api.openai.com/v1"; // Base URL

// Define a type for the model information we care about
interface OpenAIModel {
  id: string;
  owned_by: string;
  // Add other relevant fields if needed, e.g., created
}

// Define the structure for the API response
interface ListModelsResponse {
  data: OpenAIModel[];
  object: string;
}

// Define the result type for our function
interface ModelsResult {
  success: boolean;
  models?: OpenAIModel[];
  error?: { message: string; type?: string; code?: string };
}

/**
 * Fetches the list of available models from the OpenAI API.
 */
export const getAvailableModels = async (
  apiKey: string
): Promise<ModelsResult> => {
  if (!apiKey) {
    return { success: false, error: { message: "No API key provided" } };
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/models`, {
      // Correct endpoint
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const responseText = await response.text(); // Read response text first

    if (!response.ok) {
      let errorData: any = {
        error: { message: `Request failed (${response.status})` },
      };
      try {
        errorData = JSON.parse(responseText); // Try parsing error details
      } catch (e) {
        console.error("Failed to parse error response JSON:", responseText);
      }
      console.error("OpenAI API Error Response (Models):", errorData);
      return {
        success: false,
        error: {
          message:
            errorData?.error?.message || `Request failed (${response.status})`,
          type: errorData?.error?.type,
          code: errorData?.error?.code,
        },
      };
    }

    // Parse the successful response
    let data: ListModelsResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "Failed to parse models list JSON:",
        responseText,
        parseError
      );
      return {
        success: false,
        error: { message: "Failed to parse API response JSON" },
      };
    }

    // Optional: Filter models if desired (e.g., only show GPT models)
    const filteredModels = data.data
      .filter(
        (model) =>
          model.id.includes("gpt") &&
          !model.id.includes("instruct") &&
          !model.id.includes("vision")
      )
      .sort((a, b) => a.id.localeCompare(b.id)); // Sort alphabetically

    return {
      success: true,
      models: filteredModels, // Return filtered models
    };
  } catch (error) {
    console.error("Network or other error fetching models:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown network error",
      },
    };
  }
};

/**
 * Uses OpenAI API to suggest categories for a list of prompts.
 * Adapted for React Native (removed Workspace usage).
 */
export const getCategorySuggestions = async (
  apiKey: string,
  prompts: Prompt[],
  modelId: string
): Promise<CategoryResult> => {
  if (!apiKey) {
    return {
      success: false,
      error: { message: "No API key provided" },
    };
  }

  if (!prompts || prompts.length === 0) {
    return {
      success: true,
      suggestions: [], // Return empty suggestions if no prompts
    };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that categorizes prompts.
            Please analyze the provided prompts (given as a JSON array of objects with id and text) and suggest a concise, relevant category (1-3 words max) for each one.
            Return your response ONLY as a valid JSON object in the following format, ensuring no extra text or markdown formatting:
            {
              "suggestions": [
                {
                  "promptId": "id_from_input_prompt1",
                  "category": "Suggested Category 1"
                },
                {
                  "promptId": "id_from_input_prompt2",
                  "category": "Suggested Category 2"
                }
              ]
            }
            Your response MUST be valid JSON. Only include prompts that were provided in the input. Use the exact promptId from the input.`, // Updated system prompt for clarity
          },
          {
            role: "user",
            // Send only id and text to the API
            content: JSON.stringify(
              prompts.map((p) => ({ id: p.id, text: p.text }))
            ),
          },
        ],
        response_format: { type: "json_object" }, // Request JSON output
        temperature: 0.3,
        max_tokens: 1500, // Adjust as needed
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData: any = {
        error: { message: "Request failed with status: " + response.status },
      };
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse error response JSON:", responseText);
      }
      console.error("OpenAI API Error Response:", errorData);
      return {
        success: false,
        error: {
          message:
            errorData?.error?.message || `Request failed (${response.status})`,
          type: errorData?.error?.type,
          code: errorData?.error?.code,
        },
      };
    }

    // Parse the successful response text to get the outer structure
    let outerData;
    try {
      outerData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "Failed to parse outer API response JSON:",
        responseText,
        parseError
      );
      return {
        success: false,
        error: { message: "Failed to parse outer API response JSON" },
      };
    }

    // Extract the message content string which should contain the inner JSON
    const contentString = outerData.choices?.[0]?.message?.content;

    if (!contentString || typeof contentString !== "string") {
      console.error(
        "API response missing or has invalid message content:",
        outerData
      );
      return {
        success: false,
        error: {
          message:
            "API response missing or has invalid message content structure.",
        },
      };
    }

    // Now parse the inner JSON string from the message content
    try {
      const parsedContent = JSON.parse(contentString);
      console.log("Parsed OpenAI Message Content:", parsedContent);

      // Validate the structure of the inner JSON
      if (!parsedContent || !Array.isArray(parsedContent.suggestions)) {
        console.error(
          "Unexpected inner JSON structure received:",
          parsedContent
        );
        return {
          success: false,
          error: {
            message:
              "API message content returned unexpected JSON structure. Expected { suggestions: [...] }",
          },
        };
      }

      // Optional: Further validation of suggestion items
      const validSuggestions = parsedContent.suggestions.filter(
        (s: any): s is CategorySuggestion =>
          typeof s === "object" &&
          s !== null &&
          typeof s.promptId === "string" &&
          typeof s.category === "string"
      );

      if (validSuggestions.length !== parsedContent.suggestions.length) {
        console.warn(
          "Some suggestions had invalid format and were filtered out."
        );
      }

      return {
        success: true,
        suggestions: validSuggestions,
      };
    } catch (innerParseError) {
      console.error(
        "Failed to parse inner JSON from message content:",
        contentString,
        innerParseError
      );
      return {
        success: false,
        error: { message: "Failed to parse JSON from API message content" },
      };
    }
  } catch (error) {
    console.error("Network or other error calling OpenAI API:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown network error",
      },
    };
  }
};

// Define types for the prompt enhancer
export interface EnhancementHistoryItem {
  role: "user" | "assistant"; // Keep track of who said what
  content: string;
}

interface EnhancePromptResult {
  success: boolean;
  enhancedPrompt?: string;
  error?: { message: string; type?: string; code?: string };
}

/**
 * Uses OpenAI API to enhance a given prompt based on context and feedback.
 */
export const enhancePrompt = async (
  apiKey: string,
  modelId: string,
  originalPrompt: string,
  history: EnhancementHistoryItem[] = [], // Optional history of previous iterations
  feedback: string | null = null // Optional user feedback for current iteration
): Promise<EnhancePromptResult> => {
  if (!apiKey) {
    return { success: false, error: { message: "No API key provided" } };
  }
  if (!modelId) {
    return { success: false, error: { message: "No model ID selected" } };
  }
  if (!originalPrompt) {
    return { success: false, error: { message: "No prompt text provided" } };
  }

  // Construct the messages array for the API call
  const messages = [
    {
      role: "system",
      content: `You are an AI assistant specialized in refining and enhancing user prompts for Large Language Models (like yourself). Your goal is to improve the clarity, detail, effectiveness, and overall quality of the prompt based on the user's request and any provided feedback. Maintain the original intent but make it a better prompt.
            ${
              history.length > 0
                ? "Consider the previous iterations provided in the history."
                : ""
            }
            Respond ONLY with the enhanced prompt text, without any preamble, explanation, or markdown formatting.`,
    },
    // Add history items (if any)
    ...history,
    // Add the current prompt to enhance (as user role)
    {
      role: "user",
      content: `Original Prompt: "${originalPrompt}"
            ${
              feedback
                ? `User Feedback for this iteration: "${feedback}"`
                : "Please enhance this prompt."
            }`,
    },
  ];

  console.log(
    "[enhancePrompt] Sending messages:",
    JSON.stringify(messages, null, 2)
  );

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      // Use chat completions endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        temperature: 0.5, // Adjust temperature as desired for creativity vs predictability
        max_tokens: 500, // Adjust token limit based on expected prompt length
        n: 1,
        stop: null,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData: any = {
        error: { message: `Request failed (${response.status})` },
      };
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        /* Ignore parsing error if response not JSON */
      }
      console.error("[enhancePrompt] OpenAI API Error:", errorData);
      return {
        success: false,
        error: {
          message:
            errorData?.error?.message || `Request failed (${response.status})`,
          type: errorData?.error?.type,
          code: errorData?.error?.code,
        },
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "[enhancePrompt] Failed to parse success response JSON:",
        responseText,
        parseError
      );
      // Sometimes the model might respond with plain text even if JSON is expected
      // If we get here, maybe the responseText itself is the enhanced prompt?
      // Let's make a cautious assumption:
      if (responseText.trim().length > 0) {
        console.log(
          "[enhancePrompt] Parsed as plain text:",
          responseText.trim()
        );
        return { success: true, enhancedPrompt: responseText.trim() };
      }
      return {
        success: false,
        error: { message: "Failed to parse API response JSON" },
      };
    }

    const enhancedPromptText = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedPromptText) {
      console.error(
        "[enhancePrompt] API response missing enhanced prompt content:",
        data
      );
      return {
        success: false,
        error: { message: "API response structure invalid or missing content" },
      };
    }

    console.log("[enhancePrompt] Received enhancement:", enhancedPromptText);
    return { success: true, enhancedPrompt: enhancedPromptText };
  } catch (error) {
    console.error("[enhancePrompt] Network or other error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown network error",
      },
    };
  }
};
