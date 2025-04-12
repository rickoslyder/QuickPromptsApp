import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Prompt, UserSettings, StorageData } from "../types";

// Storage keys (Updated to be valid for SecureStore and AsyncStorage)
const PROMPTS_KEY = "QuickPrompts_prompts";
const USER_SETTINGS_KEY = "QuickPrompts_userSettings";
const SECURE_API_KEY = "QuickPrompts_secureApiKey";

// Default data to initialize storage
const defaultData: StorageData = {
  prompts: [],
  userSettings: {
    // API key is handled separately by secure storage
  },
};

/**
 * Get all storage data (prompts and basic settings) from AsyncStorage.
 * Handles potential parsing errors and returns defaults if data is missing or corrupt.
 */
export const getStorageData = async (): Promise<StorageData> => {
  try {
    const promptsJson = await AsyncStorage.getItem(PROMPTS_KEY);
    const userSettingsJson = await AsyncStorage.getItem(USER_SETTINGS_KEY);

    const prompts = promptsJson ? JSON.parse(promptsJson) : defaultData.prompts;
    const userSettings = userSettingsJson
      ? JSON.parse(userSettingsJson)
      : defaultData.userSettings;

    // Basic validation
    if (!Array.isArray(prompts)) {
      console.warn("Corrupt prompts data found in AsyncStorage, resetting.");
      await savePrompts(defaultData.prompts); // Attempt to fix corruption
      return { ...defaultData, userSettings };
    }
    if (typeof userSettings !== "object" || userSettings === null) {
      console.warn(
        "Corrupt user settings data found in AsyncStorage, resetting."
      );
      await saveUserSettings(defaultData.userSettings); // Attempt to fix corruption
      return { ...defaultData, prompts };
    }

    return { prompts, userSettings };
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
    // Return defaults in case of any error
    return { ...defaultData };
  }
};

/**
 * Save the entire StorageData object (prompts and basic settings) to AsyncStorage.
 * Note: API key is typically handled by secure storage, not directly here.
 */
export const setStorageData = async (data: StorageData): Promise<void> => {
  try {
    const promptsJson = JSON.stringify(data.prompts || []);
    const userSettingsJson = JSON.stringify(data.userSettings || {}); // Ensure userSettings is always an object
    await AsyncStorage.setItem(PROMPTS_KEY, promptsJson);
    await AsyncStorage.setItem(USER_SETTINGS_KEY, userSettingsJson);
  } catch (error) {
    console.error("Error writing to AsyncStorage:", error);
    throw new Error(`Failed to save data: ${error}`);
  }
};

/**
 * Get prompts array from storage.
 */
export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    const data = await getStorageData();
    return data.prompts || [];
  } catch (error) {
    console.error("Error getting prompts:", error);
    return [];
  }
};

/**
 * Save prompts array to storage.
 */
export const savePrompts = async (prompts: Prompt[]): Promise<void> => {
  try {
    const data = await getStorageData(); // Get current settings to avoid overwriting them
    data.prompts = prompts;
    await setStorageData(data);
  } catch (error) {
    console.error("Error saving prompts:", error);
    throw new Error(`Failed to save prompts: ${error}`);
  }
};

/**
 * Get user settings object from storage (excluding securely stored API key).
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const data = await getStorageData();
    // Intentionally return only non-sensitive settings stored here
    // API key should be fetched separately using its dedicated secure storage function
    return data.userSettings || {};
  } catch (error) {
    console.error("Error getting user settings:", error);
    return {};
  }
};

/**
 * Save user settings object to storage (excluding securely stored API key).
 */
export const saveUserSettings = async (
  settings: UserSettings
): Promise<void> => {
  try {
    const data = await getStorageData(); // Get current prompts to avoid overwriting them
    // Ensure we don't accidentally save the API key here if it was passed in
    const { openAIApiKey, ...otherSettings } = settings;
    data.userSettings = otherSettings;
    await setStorageData(data);
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw new Error(`Failed to save user settings: ${error}`);
  }
};

/**
 * Save the OpenAI API key securely.
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    if (!apiKey) {
      // If the key is empty, delete it from secure store
      await SecureStore.deleteItemAsync(SECURE_API_KEY);
    } else {
      await SecureStore.setItemAsync(SECURE_API_KEY, apiKey);
    }
  } catch (error) {
    console.error("Error saving API key to SecureStore:", error);
    throw new Error(`Failed to save API key: ${error}`);
  }
};

/**
 * Get the OpenAI API key from secure storage.
 */
export const getApiKey = async (): Promise<string | null> => {
  try {
    const apiKey = await SecureStore.getItemAsync(SECURE_API_KEY);
    return apiKey;
  } catch (error) {
    console.error("Error reading API key from SecureStore:", error);
    return null; // Return null in case of error
  }
};

/**
 * Initialize storage with default data if keys don't exist.
 * Called on app startup.
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    const promptsExists = (await AsyncStorage.getItem(PROMPTS_KEY)) !== null;
    const settingsExists =
      (await AsyncStorage.getItem(USER_SETTINGS_KEY)) !== null;

    if (!promptsExists || !settingsExists) {
      console.log("Initializing AsyncStorage with default data...");
      // Get current potentially partial data and merge with defaults
      const currentData = await getStorageData();
      const dataToSave: StorageData = {
        prompts: promptsExists ? currentData.prompts : defaultData.prompts,
        userSettings: settingsExists
          ? currentData.userSettings
          : defaultData.userSettings,
      };
      await setStorageData(dataToSave);
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    // Attempt to set defaults even if read fails
    await setStorageData(defaultData).catch((e) =>
      console.error("Failed to set default data during init error:", e)
    );
  }
};
