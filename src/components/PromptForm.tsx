import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Prompt } from '../types';
import { Colors, defaultPromptColors, availableIcons } from '../utils/constants';
import ColorPickerInput from './ColorPickerInput';
import IconPicker from './IconPicker';
import Button from './Button';

interface PromptFormProps {
    initialPrompt?: Prompt | null;
    onSubmit: (promptData: Omit<Prompt, 'id'> | Prompt) => void; // Accepts full Prompt for update, Omit<...> for add
    onCancel: () => void;
    onDelete?: (id: string) => void; // Optional delete handler for edit mode
    isEditMode: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
    initialPrompt,
    onSubmit,
    onCancel,
    onDelete,
    isEditMode,
}) => {
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [category, setCategory] = useState('');
    const [color, setColor] = useState(defaultPromptColors[0]);
    const [icon, setIcon] = useState(availableIcons[0]);

    useEffect(() => {
        if (initialPrompt) {
            setName(initialPrompt.name || '');
            setText(initialPrompt.text);
            setCategory(initialPrompt.category || '');
            setColor(initialPrompt.color || defaultPromptColors[0]);
            setIcon(initialPrompt.icon || availableIcons[0]);
        } else {
            // Reset for Add mode
            setName('');
            setText('');
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
            alert('Prompt text cannot be empty'); // Use Alert for native feel
            return;
        }

        const promptName = name.trim() || generateDefaultName(text);

        const promptData = {
            name: promptName,
            text: text.trim(),
            category: category.trim(),
            color,
            icon,
        };

        if (isEditMode && initialPrompt) {
            onSubmit({ ...promptData, id: initialPrompt.id }); // Pass full prompt with ID for update
        } else {
            onSubmit(promptData); // Pass Omit<Prompt, 'id'> for add
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Prompt Name (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="E.g., Explain Code Snippet"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Prompt Text *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={text}
                        onChangeText={setText}
                        placeholder="Enter the full prompt text here..."
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                        required // HTML attribute, ignored by RN but good for semantics
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
                            onPress={() => onDelete(initialPrompt.id)} // Pass ID to delete handler
                            variant="danger"
                            style={styles.deleteButton}
                        />
                    )}
                </View>
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
        paddingBottom: 30, // Ensure space at the bottom for buttons
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
        textAlignVertical: 'top', // Align text to top for multiline
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
});

export default PromptForm; 