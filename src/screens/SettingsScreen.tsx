import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { SettingsScreenProps } from '../navigation/types';
import { useSettings } from '../hooks/useSettings';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { Colors } from '../utils/constants';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const {
        apiKey: currentApiKey, // Rename for clarity
        isLoading,
        error,
        updateApiKey,
        fetchSettings, // Get fetch function
    } = useSettings();

    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Update local input state when the key is loaded from the hook
    useEffect(() => {
        if (currentApiKey !== null && !isLoading) {
            setApiKeyInput(currentApiKey || '');
        }
    }, [currentApiKey, isLoading]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateApiKey(apiKeyInput.trim());
            Alert.alert('Success', 'API Key saved successfully.');
            // Optionally navigate back or stay on the settings screen
            // navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to save API Key.');
            console.error('Save API Key error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && currentApiKey === null) {
        // Show loading indicator only on initial load
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>OpenAI API Key</Text>
                <Text style={styles.description}>
                    Optionally provide your OpenAI API key to enable the AI-based prompt categorization feature. Your key is stored securely on this device.
                </Text>

                {error && (
                    <Text style={styles.errorText}>Error loading settings: {error}</Text>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>API Key</Text>
                    <TextInput
                        style={styles.input}
                        value={apiKeyInput}
                        onChangeText={setApiKeyInput}
                        placeholder="sk-..."
                        placeholderTextColor={Colors.textSecondary}
                        secureTextEntry // Hide the API key
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading && !isSaving} // Disable input while loading/saving
                    />
                </View>

                <Button
                    title={isSaving ? 'Saving...' : 'Save API Key'}
                    onPress={handleSave}
                    disabled={isLoading || isSaving}
                    variant="primary"
                />

                {/* Add a button to navigate to AI Categorization */}
                <Button
                    title="Go to AI Categorization"
                    onPress={() => navigation.navigate('AICategorization')}
                    variant="outline"
                    style={styles.navButton}
                    disabled={isLoading || isSaving}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        color: Colors.text,
    },
    errorText: {
        color: Colors.error,
        marginBottom: 16,
        textAlign: 'center',
    },
    navButton: {
        marginTop: 15,
    },
});

export default SettingsScreen; 