import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform as RNPlatform,
    ActivityIndicator,
} from 'react-native';
import { Prompt } from '../types';
import { Colors, defaultPromptColors, availableIcons } from '../utils/constants';
import ColorPickerInput from './ColorPickerInput';
import IconPicker from './IconPicker';
import Button from './Button';

interface EnhancerProps {
    apiKey: string | null;
    settingsLoading: boolean;
    enhancerPreview: string | null;
    isEnhancing: boolean;
    enhancerError: string | null;
    enhancerFeedback: string;
    onEnhancerFeedbackChange: (text: string) => void;
    onEnhance: () => void;
    onRegenerate: () => void;
    onAcceptSuggestion: () => void;
}

interface PromptFormProps {
    initialPrompt?: Prompt | null;
    name: string;
    onNameChange: (name: string) => void;
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: (promptData: Omit<Prompt, 'id'> | Prompt) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
    isEditMode: boolean;
    enhancerProps?: EnhancerProps;
}

const PromptForm: React.FC<PromptFormProps> = ({
    initialPrompt,
    name,
    onNameChange,
    text,
    onTextChange,
    onSubmit,
    onCancel,
    onDelete,
    isEditMode,
    enhancerProps,
}) => {
    const [category, setCategory] = useState('');
    const [color, setColor] = useState(defaultPromptColors[0]);
    const [icon, setIcon] = useState(availableIcons[0]);

    useEffect(() => {
        if (initialPrompt) {
            setCategory(initialPrompt.category || '');
            setColor(initialPrompt.color || defaultPromptColors[0]);
            setIcon(initialPrompt.icon || availableIcons[0]);
        } else {
            setCategory('');
            setColor(defaultPromptColors[0]);
            setIcon(availableIcons[0]);
        }
    }, [initialPrompt]);

    const generateDefaultName = (promptText: string): string => {
        return promptText.trim().split(' ').slice(0, 5).join(' ') + (promptText.length > 30 ? '...' : '');
    };

    const handleSubmit = () => {
        if (!text.trim()) {
            alert('Prompt text cannot be empty');
            return;
        }

        const promptName = name.trim() || generateDefaultName(text);

        console.log("[PromptForm Log] HandleSubmit Details:");
        console.log("  - name state:", name);
        console.log("  - name.trim():", name.trim());
        console.log("  - generatedName:", generateDefaultName(text));
        console.log("  - final promptName:", promptName);

        const promptData = {
            name: promptName,
            text: text.trim(),
            category: category.trim(),
            color,
            icon,
        };

        if (isEditMode && initialPrompt) {
            onSubmit({ ...promptData, id: initialPrompt.id });
        } else {
            onSubmit(promptData);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={RNPlatform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Prompt Name (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={onNameChange}
                        placeholder="E.g., Explain Code Snippet"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Prompt Text *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={text}
                        onChangeText={onTextChange}
                        placeholder="Enter the full prompt text here..."
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Category (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={category}
                        onChangeText={setCategory}
                        placeholder="E.g., Coding, Writing, Fun"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                <ColorPickerInput currentColor={color} onSelectColor={setColor} />

                <IconPicker currentIcon={icon} onSelectIcon={setIcon} />

                <View style={styles.buttonContainer}>
                    <Button title={isEditMode ? "Update Prompt" : "Add Prompt"} onPress={handleSubmit} variant="primary" />
                    <Button title="Cancel" onPress={onCancel} variant="secondary" style={styles.cancelButton} />
                    {isEditMode && onDelete && initialPrompt && (
                        <Button
                            title="Delete Prompt"
                            onPress={() => onDelete(initialPrompt.id)}
                            variant="danger"
                            style={styles.deleteButton}
                        />
                    )}
                </View>

                {!isEditMode && enhancerProps && (
                    <View style={styles.enhancerSection}>
                        <Text style={styles.enhancerTitle}>✨ AI Prompt Enhancer</Text>
                        <Text style={styles.enhancerDescription}>
                            Let AI improve your prompt! Enter initial text above, then click Enhance.
                        </Text>

                        <Button
                            title={enhancerProps.isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                            onPress={enhancerProps.onEnhance}
                            disabled={enhancerProps.isEnhancing || !enhancerProps.apiKey || enhancerProps.settingsLoading}
                            variant="outline"
                            style={styles.enhancerButton}
                            iconName="brain"
                        />
                        {!enhancerProps.apiKey && <Text style={styles.apiKeyWarning}> (Requires API Key in Settings)</Text>}

                        {enhancerProps.enhancerPreview && !enhancerProps.isEnhancing && (
                            <View style={styles.previewSection}>
                                <Text style={styles.previewLabel}>Suggested Enhancement:</Text>
                                <Text style={styles.previewText}>{enhancerProps.enhancerPreview}</Text>
                                <Button
                                    title="Accept Suggestion"
                                    onPress={enhancerProps.onAcceptSuggestion}
                                    variant="primary"
                                    style={styles.enhancerButton}
                                    iconName="check"
                                />
                            </View>
                        )}

                        {enhancerProps.isEnhancing && <ActivityIndicator size="small" color={Colors.primary} style={styles.enhancerLoading} />}
                        {enhancerProps.enhancerError && <Text style={styles.errorText}>{enhancerProps.enhancerError}</Text>}

                        {enhancerProps.enhancerPreview && !enhancerProps.isEnhancing && (
                            <View style={styles.feedbackSection}>
                                <Text style={styles.label}>Feedback (Optional):</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={enhancerProps.enhancerFeedback}
                                    onChangeText={enhancerProps.onEnhancerFeedbackChange}
                                    placeholder="e.g., 'Make it more formal', 'Add examples'"
                                    placeholderTextColor={Colors.textSecondary}
                                    multiline
                                />
                                <Button
                                    title={enhancerProps.isEnhancing ? 'Regenerating...' : 'Regenerate with Feedback'}
                                    onPress={enhancerProps.onRegenerate}
                                    disabled={enhancerProps.isEnhancing || !enhancerProps.enhancerFeedback.trim()}
                                    variant="outline"
                                    style={styles.enhancerButton}
                                    iconName="refresh"
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 30,
    },
    formGroup: {
        marginBottom: 16,
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
        paddingTop: 16,
    },
    cancelButton: {
        marginTop: 10,
    },
    deleteButton: {
        marginTop: 10,
    },
    enhancerSection: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
    },
    enhancerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    enhancerDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 15,
    },
    enhancerButton: {
        marginTop: 10,
        marginBottom: 10,
    },
    apiKeyWarning: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    enhancerLoading: {
        marginVertical: 15,
        alignSelf: 'center',
    },
    previewSection: {
        marginTop: 15,
        marginBottom: 15,
        padding: 12,
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 5,
    },
    previewText: {
        fontSize: 15,
        color: Colors.text,
        lineHeight: 22,
        marginBottom: 10,
    },
    feedbackSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
    },
    errorText: {
        color: Colors.error,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
        fontSize: 13,
    },
});

export default PromptForm; 