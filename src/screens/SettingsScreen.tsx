import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';
import { Picker as NativePicker } from '@react-native-picker/picker';
const Picker = NativePicker as unknown as React.FC<any>;
import { SettingsScreenProps } from '../navigation/types';
import { useSettings } from '../context/SettingsContext';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { Colors, DEFAULT_MODEL_ID } from '../utils/constants';
import { getAvailableModels } from '../utils/openaiApi';

interface OpenAIModel {
    id: string;
    owned_by: string;
}

interface Settings {
    apiKey: string;
    selectedModelId: string | null;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const {
        apiKey: loadedApiKey,
        selectedModelId: loadedModelId,
        isLoading: settingsLoading,
        error: settingsError,
        saveSettings,
    } = useSettings();

    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [selectedModelIdInput, setSelectedModelIdInput] = useState<string | null>(DEFAULT_MODEL_ID);

    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [modelsLoading, setModelsLoading] = useState<boolean>(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState<boolean>(false);

    // State for modal visibility
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    useEffect(() => {
        if (!settingsLoading) {
            setApiKeyInput(loadedApiKey || '');
            setSelectedModelIdInput(loadedModelId || DEFAULT_MODEL_ID);
        }
    }, [loadedApiKey, loadedModelId, settingsLoading]);

    const fetchModels = useCallback(async (key: string) => {
        if (!key || key.length < 10) {
            setModels([]);
            setModelsError(null);
            return;
        }
        console.log("Fetching models with key...");
        setModelsLoading(true);
        setModelsError(null);
        setModels([]);
        try {
            const result = await getAvailableModels(key);
            if (result.success && result.models) {
                console.log("Models fetched:", result.models.length);
                setModels(result.models);
                if (selectedModelIdInput && !result.models.some(m => m.id === selectedModelIdInput)) {
                    console.warn(`Selected model ${selectedModelIdInput} not found in fetched list, resetting.`);
                    setSelectedModelIdInput(DEFAULT_MODEL_ID);
                }
            } else {
                console.error("Failed to fetch models:", result.error?.message);
                setModelsError(result.error?.message || 'Failed to fetch models');
            }
        } catch (err) {
            console.error('Fetch models error:', err);
            setModelsError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setModelsLoading(false);
            console.log("Model fetching finished.");
        }
    }, [selectedModelIdInput]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchModels(apiKeyInput.trim());
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [apiKeyInput, fetchModels]);

    const handleSave = async () => {
        setIsSaving(true);
        const keyToSave = apiKeyInput.trim();
        const modelToSave = selectedModelIdInput;

        const settingsToSave: Settings = {
            apiKey: keyToSave,
            selectedModelId: modelToSave
        };

        try {
            await saveSettings(settingsToSave);
            Alert.alert('Success', 'Settings saved successfully.');
        } catch (err) {
            Alert.alert('Error', 'Failed to save settings.');
            console.error('Save Settings error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to get model label
    const getSelectedModelLabel = () => {
        const selectedModel = models.find(m => m.id === selectedModelIdInput);
        return selectedModel ? selectedModel.id : (selectedModelIdInput || 'Select a model');
    };

    if (settingsLoading && !loadedApiKey && !loadedModelId) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                {settingsError && (
                    <Text style={styles.errorText}>Error loading settings: {settingsError}</Text>
                )}

                <Text style={styles.sectionTitle}>OpenAI API Key</Text>
                <Text style={styles.description}>
                    Provide your OpenAI API key to enable AI features like categorization and enhancement. Your key is stored locally.
                </Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={apiKeyInput}
                        onChangeText={setApiKeyInput}
                        placeholder="Enter your OpenAI API Key (sk-...)"
                        placeholderTextColor={Colors.textSecondary}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!settingsLoading && !isSaving}
                    />
                </View>

                <Text style={styles.sectionTitle}>AI Model</Text>
                <Text style={styles.description}>
                    Select the OpenAI model to use for AI features.
                </Text>

                {!apiKeyInput && (
                    <Text style={styles.placeholderText}>Enter API Key above to load models.</Text>
                )}

                {apiKeyInput && (
                    Platform.OS === 'ios' ? (
                        <TouchableOpacity
                            style={styles.pickerTrigger}
                            onPress={() => setIsPickerVisible(true)}
                            disabled={settingsLoading || isSaving || modelsLoading || models.length === 0}
                        >
                            <Text style={styles.pickerTriggerText}>{getSelectedModelLabel()}</Text>
                            {modelsLoading && <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />}
                            {!modelsLoading && <Text style={styles.dropdownIcon}>▼</Text>}
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.pickerContainer]}>
                            {modelsLoading && <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />}
                            <Picker
                                selectedValue={selectedModelIdInput}
                                onValueChange={(itemValue: string | null) => setSelectedModelIdInput(itemValue)}
                                enabled={!settingsLoading && !isSaving && !modelsLoading && models.length > 0}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                                dropdownIconColor={Colors.primary}
                            >
                                {models.length === 0 && !modelsLoading && !modelsError && (
                                    <NativePicker.Item label="No compatible models found" value={null} enabled={false} style={styles.pickerItemDisabled} />
                                )}
                                {modelsError && (
                                    <NativePicker.Item label={`Error: ${modelsError.substring(0, 30)}...`} value={null} enabled={false} style={styles.pickerItemDisabled} />
                                )}
                                {modelsLoading && (
                                    <NativePicker.Item label="Loading models..." value={null} enabled={false} style={styles.pickerItemDisabled} />
                                )}
                                {models.map((model) => (
                                    <NativePicker.Item key={model.id} label={model.id} value={model.id} />
                                ))}
                            </Picker>
                        </View>
                    )
                )}

                {Platform.OS === 'ios' && (
                    <Modal
                        transparent={true}
                        visible={isPickerVisible}
                        animationType="slide"
                        onRequestClose={() => setIsPickerVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Picker
                                    selectedValue={selectedModelIdInput}
                                    onValueChange={(itemValue: string | null) => setSelectedModelIdInput(itemValue)}
                                    style={styles.modalPicker}
                                    itemStyle={styles.pickerItem}
                                >
                                    {models.map((model) => (
                                        <NativePicker.Item key={model.id} label={model.id} value={model.id} />
                                    ))}
                                </Picker>
                                <Button title="Done" onPress={() => setIsPickerVisible(false)} variant="primary" />
                            </View>
                        </View>
                    </Modal>
                )}

                <Button
                    title={isSaving ? 'Saving...' : 'Save Settings'}
                    onPress={handleSave}
                    disabled={settingsLoading || isSaving || modelsLoading}
                    variant="primary"
                />

                <Button
                    title="Go to AI Categorization"
                    onPress={() => navigation.navigate('AICategorization')}
                    variant="outline"
                    style={styles.navButton}
                    disabled={settingsLoading || isSaving}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 30,
    },
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 8,
    },
    placeholderText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.background,
        marginBottom: 20,
        justifyContent: 'center',
    },
    picker: {
        color: Colors.text,
        ...(Platform.OS === 'android' && { height: 50 }),
    },
    pickerItem: {
        color: Colors.text,
    },
    pickerItemDisabled: {
        color: Colors.textSecondary,
    },
    loadingIndicator: {
        position: 'absolute',
        right: Platform.OS === 'ios' ? 35 : 15,
        top: 15,
    },
    pickerTrigger: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.background,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
        minHeight: 50,
        justifyContent: 'center',
        position: 'relative',
    },
    pickerTriggerText: {
        fontSize: 16,
        color: Colors.text,
    },
    dropdownIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
    },
    modalPicker: {
        width: '100%',
    },
});

export default SettingsScreen; 