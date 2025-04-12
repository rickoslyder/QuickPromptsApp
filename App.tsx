import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeStorage } from './src/utils/storage'; // Import initializeStorage
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // Import the specific icon set

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            console.log('[App Log] prepare() called');
            try {
                console.log('[App Log] Pre-loading fonts...');
                await Font.loadAsync({
                    ...MaterialCommunityIcons.font, // Load the specific font
                });
                console.log('[App Log] Fonts pre-loaded successfully.');

                // Initialize storage (Still commented out)
                // console.log('[App Log] Initializing storage...');
                // await initializeStorage();
                // console.log('[App Log] Storage initialized.');

            } catch (e) {
                console.error('[App Log] Error during prepare():', e); // Log specific errors
            } finally {
                console.log('[App Log] Setting appIsReady = true');
                // Tell the application to render
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately!
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null; // Return null or a custom loading component while waiting
    }

    return (
        <SafeAreaProvider onLayout={onLayoutRootView}> // Call hideAsync after layout
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
} 