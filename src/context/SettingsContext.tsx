import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MODEL_ID } from '../utils/constants'; // Ensure this path is correct

const SETTINGS_STORAGE_KEY = '@AppSettings';

interface Settings {
    apiKey: string;
    selectedModelId: string | null;
}

interface SettingsContextProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    selectedModelId: string | null;
    setSelectedModelId: (modelId: string | null) => void;
    isLoading: boolean;
    error: string | null;
    saveSettings: (settingsToSave: Settings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [apiKey, setApiKeyInternal] = useState<string>('');
    const [selectedModelId, setSelectedModelIdInternal] = useState<string | null>(DEFAULT_MODEL_ID);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        console.log("[SettingsContext] Loading settings...");
        setIsLoading(true);
        setError(null);
        try {
            const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (settingsJson !== null) {
                const loadedSettings: Settings = JSON.parse(settingsJson);
                console.log("[SettingsContext] Loaded settings:", loadedSettings);
                setApiKeyInternal(loadedSettings.apiKey || '');
                setSelectedModelIdInternal(loadedSettings.selectedModelId || DEFAULT_MODEL_ID);
            } else {
                console.log("[SettingsContext] No settings found, using defaults.");
                setApiKeyInternal('');
                setSelectedModelIdInternal(DEFAULT_MODEL_ID);
            }
        } catch (e) {
            console.error("[SettingsContext] Failed to load settings:", e);
            setError(e instanceof Error ? e.message : "Failed to load settings");
        } finally {
            setIsLoading(false);
            console.log("[SettingsContext] Settings loading finished.");
        }
    }, []);

    const saveSettings = useCallback(async (settingsToSave: Settings) => {
        console.log("[SettingsContext] Saving settings...", settingsToSave);
        setIsLoading(true);
        setError(null);
        try {
            setApiKeyInternal(settingsToSave.apiKey);
            setSelectedModelIdInternal(settingsToSave.selectedModelId);
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
            console.log("[SettingsContext] Saved settings:", settingsToSave);
        } catch (e) {
            console.error("[SettingsContext] Failed to save settings:", e);
            setError(e instanceof Error ? e.message : "Failed to save settings");
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const setApiKey = (key: string) => {
        setApiKeyInternal(key);
    };

    const setSelectedModelId = (modelId: string | null) => {
        setSelectedModelIdInternal(modelId);
    };

    return (
        <SettingsContext.Provider
            value={{
                apiKey,
                setApiKey,
                selectedModelId,
                setSelectedModelId,
                isLoading,
                error,
                saveSettings,
                loadSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}; 