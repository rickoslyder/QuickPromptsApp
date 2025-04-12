import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Prompt, PromptExportData } from "../types";

/**
 * Exports the given prompts to a JSON file and opens the share sheet.
 */
export const exportPromptsToFile = async (
  prompts: Prompt[]
): Promise<{ success: boolean; error?: string }> => {
  const exportData: PromptExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts: prompts,
  };

  const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Filesafe timestamp
  const filename = `chatgpt-quick-prompts-export-${timestamp}.json`;
  const fileUri = FileSystem.cacheDirectory + filename;

  try {
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    if (!(await Sharing.isAvailableAsync())) {
      return {
        success: false,
        error: "Sharing is not available on this device.",
      };
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json", // Set MIME type for better compatibility
      dialogTitle: "Save or Share Prompts Export",
      UTI: "public.json", // iOS Uniform Type Identifier
    });

    return { success: true };
  } catch (error) {
    console.error("Error exporting prompts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export file",
    };
  }
};

/**
 * Opens the document picker to select a JSON file and imports prompts from it.
 * Validates the file structure.
 */
export const importPromptsFromFile = async (): Promise<{
  success: boolean;
  data?: PromptExportData;
  error?: string;
}> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json", // Only allow JSON files
      copyToCacheDirectory: true, // Required for FileSystem access
    });

    // Check if the user cancelled or didn't select a file
    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log("Document picker cancelled or no file selected.");
      return { success: false, error: "File selection cancelled." };
    }

    const fileAsset = result.assets[0];

    // Double check MIME type (optional but good practice)
    if (fileAsset.mimeType && fileAsset.mimeType !== "application/json") {
      return {
        success: false,
        error: "Invalid file type selected. Please choose a .json file.",
      };
    }

    const fileUri = fileAsset.uri;
    console.log("Selected file URI:", fileUri);

    const jsonString = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsedData = JSON.parse(jsonString);

    // Validate the structure against PromptExportData
    if (
      typeof parsedData === "object" &&
      parsedData !== null &&
      parsedData.version === 1 &&
      typeof parsedData.exportedAt === "string" &&
      Array.isArray(parsedData.prompts)
      // Add more checks if needed (e.g., validate individual prompt structures)
    ) {
      return { success: true, data: parsedData as PromptExportData };
    } else {
      return {
        success: false,
        error:
          "Invalid JSON file format. The file does not match the expected export structure.",
      };
    }
  } catch (error) {
    console.error("Error importing prompts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import file",
    };
  }
};
