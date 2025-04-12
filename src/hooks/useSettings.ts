import { useState, useEffect, useCallback } from "react";
import { UserSettings } from "../types";
import {
  getUserSettings,
  saveUserSettings,
  getApiKey,
  saveApiKey,
} from "../utils/storage";

interface UseSettingsReturn {
  settings: UserSettings | null;
  apiKey: string | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateApiKey: (newApiKey: string) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    console.log("[useSettings Log] fetchSettings() called");
    setIsLoading(true);
    setError(null);
    try {
      console.log("[useSettings Log] Fetching settings and API key...");
      const [loadedSettings, loadedApiKey] = await Promise.all([
        getUserSettings(), // Fetches non-sensitive settings from AsyncStorage
        getApiKey(), // Fetches API key from SecureStore
      ]);
      console.log("[useSettings Log] Settings fetched:", loadedSettings);
      console.log(
        "[useSettings Log] API key fetched:",
        loadedApiKey ? "Exists" : "Null"
      );
      setSettings(loadedSettings);
      setApiKey(loadedApiKey);
    } catch (err) {
      console.error("[useSettings Log] Failed to fetch settings:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
      // Set defaults on error to ensure app doesn't crash
      setSettings({});
      setApiKey(null);
    } finally {
      console.log("[useSettings Log] fetchSettings() finished");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("[useSettings Log] useEffect calling fetchSettings");
    fetchSettings();
  }, [fetchSettings]);

  const updateApiKey = useCallback(async (newApiKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await saveApiKey(newApiKey);
      setApiKey(newApiKey || null); // Update local state
    } catch (err) {
      console.error("Failed to save API key:", err);
      setError(err instanceof Error ? err.message : "Failed to save API key");
      throw err; // Re-throw error so the calling component knows it failed
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      setIsLoading(true);
      setError(null);
      try {
        const currentSettings = settings || {};
        const updatedSettingsData = { ...currentSettings, ...newSettings };
        await saveUserSettings(updatedSettingsData); // Saves non-sensitive settings to AsyncStorage
        setSettings(updatedSettingsData); // Update local state
      } catch (err) {
        console.error("Failed to save settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to save settings"
        );
        throw err; // Re-throw error
      } finally {
        setIsLoading(false);
      }
    },
    [settings]
  );

  return {
    settings,
    apiKey,
    isLoading,
    error,
    fetchSettings,
    updateApiKey,
    updateSettings,
  };
};
