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
            try {
                // Pre-load fonts, make any API calls you need to do here
                await Font.loadAsync({
                    ...MaterialCommunityIcons.font, // Load the specific font
                });

                // Initialize storage (Commented out for previous debugging, uncomment if needed)
                // await initializeStorage();

                // Artificially delay for two seconds to simulate a slow load
                // await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e); // Log errors
            } finally {
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