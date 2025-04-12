// src/types/api.ts

export interface CategorySuggestion {
  promptId: string;
  category: string;
}

export interface OpenAIError {
  message: string;
  type?: string;
  code?: string;
}

export interface CategoryResult {
  success: boolean;
  suggestions?: CategorySuggestion[];
  error?: OpenAIError;
}
