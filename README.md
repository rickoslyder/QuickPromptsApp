# QuickPrompts

A mobile application (iOS & Android) for managing and using predefined prompt templates with AI services like ChatGPT. Built with React Native and Expo.

## Features

-   **📱 Mobile Prompt Library:** Create, edit, delete, and organize your favorite prompts directly on your phone.
-   **🎨 Customization:** Assign custom colors and icons (from Material Community Icons) to prompts for easy visual identification.
-   **🗂️ Categorization:** Organize prompts with custom categories.
-   **✨ AI Prompt Enhancer:** Improve your prompts using AI! Provide an initial prompt and let the selected AI model suggest enhancements iteratively.
-   **🤖 AI Auto-Categorization:** Automatically suggest categories for your prompts using an AI model (requires OpenAI API Key).
-   **⚙️ Configurable AI Model:** Choose which OpenAI model (e.g., GPT-4o-mini, GPT-4 Turbo) to use for AI features via the Settings screen.
-   **💾 Local Storage:** All prompts and settings are stored securely on your device using AsyncStorage.
-   **🔄 Import/Export:** Backup and share your prompts by exporting them to a JSON file, and import prompts from a previously exported file.
-   **📋 Quick Copy:** Easily copy prompt text to the clipboard (feature planned/partially implemented).
-   **⬆️⬇️ Reordering:** Arrange your prompts in the desired order within the list.

## Tech Stack

-   React Native
-   Expo (Managed Workflow - SDK 52)
-   TypeScript
-   React Navigation
-   AsyncStorage (for local data persistence)
-   OpenAI API (for optional AI features)

## Project Structure

```
QuickPrompts/
├── assets/              # Static assets (icon, splash screen, fonts)
├── src/
│   ├── components/      # Reusable UI components (Button, PromptForm, PromptListItem, etc.)
│   ├── context/         # React Context providers (SettingsContext)
│   ├── hooks/           # Custom React hooks (usePrompts)
│   ├── navigation/      # React Navigation setup (AppNavigator, types)
│   ├── screens/         # Application screens (PromptList, PromptEdit, Settings, etc.)
│   ├── types/           # TypeScript type definitions (Prompt, API types)
│   ├── utils/           # Utility functions (storage, openaiApi, constants)
├── App.tsx              # Main application component
├── app.json             # Expo configuration file
├── eas.json             # EAS Build configuration
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── ...                  # Other config files (.gitignore, etc.)
```

## Installation & Setup

1.  **Prerequisites:**
    *   Node.js (LTS recommended)
    *   npm or Yarn
    *   Expo Go app on your physical device (iOS or Android) OR Android Studio / Xcode for simulators.
    *   Expo CLI: `npm install -g expo-cli`

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd QuickPrompts
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

4.  **Run the application:**
    ```bash
    npx expo start
    ```
    This will start the Metro bundler.

5.  **Open the app:**
    *   **On device:** Scan the QR code shown in the terminal using the Expo Go app.
    *   **On simulator:** Press `i` in the terminal for the iOS Simulator or `a` for an Android Emulator/connected device.

## Usage

1.  **Adding Prompts:**
    *   Navigate to the main "Quick Prompts" list screen.
    *   Tap the `+` icon in the header.
    *   Fill in the prompt text (required).
    *   Optionally add a name, category, and select a color/icon.
    *   **AI Enhancer (Optional):**
        *   Ensure your OpenAI API key and desired model are set in Settings.
        *   Tap "Enhance with AI".
        *   Review the suggestion. You can "Accept Suggestion" or provide feedback and "Regenerate with Feedback".
    *   Tap "Add Prompt".

2.  **Editing/Deleting Prompts:**
    *   Tap on a prompt in the list to navigate to the "Edit Prompt" screen.
    *   Make changes and tap "Update Prompt".
    *   Tap "Delete Prompt" (and confirm) to remove it.

3.  **Using Prompts:**
    *   Tap the copy icon on a prompt item in the list (feature planned/partially implemented).

4.  **Settings:**
    *   Navigate to Settings using the cog icon in the header of the main list.
    *   Enter your OpenAI API Key to enable AI features.
    *   Select your preferred OpenAI model for enhancement and categorization.
    *   Tap "Save Settings".

5.  **AI Categorization:**
    *   Ensure your API key is saved in Settings.
    *   Navigate to Settings > "Go to AI Categorization".
    *   Tap "Fetch Category Suggestions".
    *   Review the suggestions and check the boxes for the ones you want to apply.
    *   Tap "Apply Selected Categories".

6.  **Import/Export:**
    *   Navigate to the Import/Export screen using the swap icon in the header of the main list.
    *   Follow the on-screen instructions to export your current prompts to a file or import prompts from a previously saved file.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License. (Assuming MIT - add LICENSE file if needed) 