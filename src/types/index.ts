// src/types/index.ts

export interface Prompt {
  id: string; // Unique identifier (e.g., timestamp string)
  name: string; // User-defined name (or generated default)
  text: string; // The actual prompt text
  category: string; // User-defined category (optional)
  color: string; // Hex color code (e.g., '#10a37f')
  icon: string; // Material Icon name (e.g., 'text_snippet')
}

export interface UserSettings {
  openAIApiKey?: string; // This will be stored securely, but the type definition is useful
}

export interface StorageData {
  prompts: Prompt[];
  userSettings: UserSettings; // Represents data structure in AsyncStorage, API key might be stored elsewhere
}

// Schema for Export/Import JSON file
export interface PromptExportData {
  version: 1; // Schema version number
  exportedAt: string; // ISO 8601 timestamp string (e.g., new Date().toISOString())
  prompts: Prompt[]; // The array of prompt objects
}
