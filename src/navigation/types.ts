import type { StackScreenProps } from "@react-navigation/stack";

export type RootStackParamList = {
  PromptList: undefined;
  PromptEdit: { promptId?: string }; // Optional promptId for editing
  Settings: undefined;
  AICategorization: undefined;
  ImportExport: undefined;
};

// Define individual screen props types for better type safety in components
export type PromptListScreenProps = StackScreenProps<
  RootStackParamList,
  "PromptList"
>;
export type PromptEditScreenProps = StackScreenProps<
  RootStackParamList,
  "PromptEdit"
>;
export type SettingsScreenProps = StackScreenProps<
  RootStackParamList,
  "Settings"
>;
export type AICategorizationScreenProps = StackScreenProps<
  RootStackParamList,
  "AICategorization"
>;
export type ImportExportScreenProps = StackScreenProps<
  RootStackParamList,
  "ImportExport"
>;
