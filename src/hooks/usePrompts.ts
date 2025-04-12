import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native"; // Import Alert
import { Prompt } from "../types";
import { getPrompts, savePrompts } from "../utils/storage";

interface UsePromptsReturn {
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
  fetchPrompts: () => Promise<void>;
  addPrompt: (newPrompt: Omit<Prompt, "id">) => Promise<void>;
  updatePrompt: (updatedPrompt: Prompt) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  reorderPrompt: (promptId: string, direction: "up" | "down") => Promise<void>;
  replaceAllPrompts: (newPrompts: Prompt[]) => Promise<void>;
  mergePrompts: (importedPrompts: Prompt[]) => Promise<number>; // Returns number of merged prompts
}

export const usePrompts = (): UsePromptsReturn => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    console.log("[usePrompts Log] fetchPrompts() called");
    setIsLoading(true);
    setError(null);
    try {
      console.log("[usePrompts Log] Fetching prompts from storage...");
      const loadedPrompts = await getPrompts();
      console.log(`[usePrompts Log] Fetched ${loadedPrompts.length} prompts.`);
      setPrompts(loadedPrompts);
    } catch (err) {
      console.error("[usePrompts Log] Failed to fetch prompts:", err);
      setError(err instanceof Error ? err.message : "Failed to load prompts");
      setPrompts([]); // Set empty array on error
    } finally {
      console.log("[usePrompts Log] fetchPrompts() finished");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("[usePrompts Log] useEffect calling fetchPrompts");
    fetchPrompts();
  }, [fetchPrompts]);

  const updateAndSavePrompts = useCallback(async (updatedPrompts: Prompt[]) => {
    try {
      await savePrompts(updatedPrompts);
      setPrompts(updatedPrompts);
    } catch (err) {
      console.error("Failed to save prompts:", err);
      setError(err instanceof Error ? err.message : "Failed to save prompts");
      throw err; // Re-throw error
    }
  }, []);

  const addPrompt = useCallback(
    async (newPromptData: Omit<Prompt, "id">) => {
      setIsLoading(true);
      const newPrompt: Prompt = {
        ...newPromptData,
        id: Date.now().toString(), // Generate unique ID
      };
      const updatedPrompts = [...prompts, newPrompt];
      await updateAndSavePrompts(updatedPrompts);
      setIsLoading(false);
    },
    [prompts, updateAndSavePrompts]
  );

  const updatePrompt = useCallback(
    async (updatedPrompt: Prompt) => {
      setIsLoading(true);
      const updatedPrompts = prompts.map((p) =>
        p.id === updatedPrompt.id ? updatedPrompt : p
      );
      await updateAndSavePrompts(updatedPrompts);
      setIsLoading(false);
    },
    [prompts, updateAndSavePrompts]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      setIsLoading(true);
      const updatedPrompts = prompts.filter((p) => p.id !== id);
      await updateAndSavePrompts(updatedPrompts);
      setIsLoading(false);
    },
    [prompts, updateAndSavePrompts]
  );

  const reorderPrompt = useCallback(
    async (promptId: string, direction: "up" | "down") => {
      const index = prompts.findIndex((p) => p.id === promptId);
      if (index === -1) return; // Should not happen

      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prompts.length - 1)
      ) {
        return; // Cannot move further
      }

      const newIndex = direction === "up" ? index - 1 : index + 1;
      const newPrompts = [...prompts];
      const [movedPrompt] = newPrompts.splice(index, 1);
      newPrompts.splice(newIndex, 0, movedPrompt);

      setIsLoading(true);
      await updateAndSavePrompts(newPrompts);
      setIsLoading(false);
    },
    [prompts, updateAndSavePrompts]
  );

  const replaceAllPrompts = useCallback(
    async (newPrompts: Prompt[]) => {
      setIsLoading(true);
      await updateAndSavePrompts(newPrompts);
      setIsLoading(false);
    },
    [updateAndSavePrompts]
  );

  const mergePrompts = useCallback(
    async (importedPrompts: Prompt[]) => {
      const currentPromptIds = new Set(prompts.map((p) => p.id));
      const promptsToMerge = importedPrompts.filter(
        (p) => !currentPromptIds.has(p.id)
      );

      if (promptsToMerge.length === 0) {
        Alert.alert("Merge Complete", "No new unique prompts found to merge.");
        return 0;
      }

      const updatedPrompts = [...prompts, ...promptsToMerge];
      setIsLoading(true);
      await updateAndSavePrompts(updatedPrompts);
      setIsLoading(false);
      return promptsToMerge.length;
    },
    [prompts, updateAndSavePrompts]
  );

  return {
    prompts,
    isLoading,
    error,
    fetchPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    reorderPrompt,
    replaceAllPrompts,
    mergePrompts,
  };
};
