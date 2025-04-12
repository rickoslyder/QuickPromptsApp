import { Prompt } from "../types";
import { CategoryResult, CategorySuggestion } from "../types/api";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Uses OpenAI API to suggest categories for a list of prompts.
 * Adapted for React Native (removed Workspace usage).
 */
export const getCategorySuggestions = async (
  apiKey: string,
  prompts: Prompt[]
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
        model: "gpt-4o-mini", // Or your preferred model
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
