// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { SettingsProvider } from '../context/SettingsContext';
import { Colors } from '../utils/constants';

// Import Screens
import PromptListScreen from '../screens/PromptListScreen';
import PromptEditScreen from '../screens/PromptEditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AICategorizationScreen from '../screens/AICategorizationScreen';
import ImportExportScreen from '../screens/ImportExportScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    return (
        <SettingsProvider>
            <Stack.Navigator initialRouteName="PromptList">
                <Stack.Screen
                    name="PromptList"
                    component={PromptListScreen}
                    options={{ title: 'Quick Prompts' }}
                />
                <Stack.Screen
                    name="PromptEdit"
                    component={PromptEditScreen}
                    // Title can be set dynamically based on whether it's Add or Edit mode
                    options={({ route }) => ({ title: route.params?.promptId ? 'Edit Prompt' : 'Add Prompt' })}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: 'Settings' }}
                />
                <Stack.Screen
                    name="AICategorization"
                    component={AICategorizationScreen}
                    options={{ title: 'AI Categorization' }}
                />
                <Stack.Screen
                    name="ImportExport"
                    component={ImportExportScreen}
                    options={{ title: 'Import / Export' }}
                />
            </Stack.Navigator>
        </SettingsProvider>
    );
};

export default AppNavigator; 