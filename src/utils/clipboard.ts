import * as Clipboard from "expo-clipboard";

/**
 * Copies the given text to the device clipboard.
 * Returns true if successful, false otherwise.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
    return false;
  }
};
