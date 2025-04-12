import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Alert,
    View,
    Text,
    Button,
} from 'react-native';
import { PromptEditScreenProps } from '../navigation/types';
import { usePrompts } from '../hooks/usePrompts';
import PromptForm from '../components/PromptForm';
import ScreenContainer from '../components/ScreenContainer';
import { Prompt } from '../types';
import { Colors } from '../utils/constants';

const PromptEditScreen: React.FC<PromptEditScreenProps> = ({ route, navigation }) => {
    const { promptId } = route.params || {};
    const isEditMode = !!promptId;

    const {
        prompts,
        isLoading: promptsLoading,
        addPrompt,
        updatePrompt,
        deletePrompt,
    } = usePrompts();

    // Local loading state for finding the specific prompt to edit
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(isEditMode);
    const [initialPromptData, setInitialPromptData] = useState<Prompt | null | undefined>(undefined); // undefined means not yet loaded/found

    // Find the prompt to edit once prompts are loaded
    useEffect(() => {
        if (isEditMode && !promptsLoading && prompts.length > 0) {
            const foundPrompt = prompts.find(p => p.id === promptId);
            setInitialPromptData(foundPrompt || null); // null if not found (shouldn't happen ideally)
            setIsLoadingPrompt(false);
        } else if (!isEditMode) {
            setIsLoadingPrompt(false); // Not edit mode, no prompt to load
            setInitialPromptData(null); // Explicitly set to null for add mode
        }
    }, [isEditMode, promptId, promptsLoading, prompts]);

    const handleFormSubmit = async (promptData: Omit<Prompt, 'id'> | Prompt) => {
        try {
            if (isEditMode) {
                await updatePrompt(promptData as Prompt);
            } else {
                await addPrompt(promptData as Omit<Prompt, 'id'>);
            }
            navigation.goBack(); // Go back to the list screen on success
        } catch (error) {
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} prompt.`);
            console.error('Prompt save error:', error);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Prompt',
            'Are you sure you want to permanently delete this prompt?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await deletePrompt(id);
                            navigation.goBack(); // Go back after successful delete
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete prompt.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Loading state for finding the prompt or initial prompts loading
    if (isLoadingPrompt || (isEditMode && initialPromptData === undefined)) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    // Handle case where prompt ID was provided but prompt wasn't found
    if (isEditMode && initialPromptData === null) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <Text style={styles.errorText}>Error: Prompt not found.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} color={Colors.primary} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <PromptForm
                initialPrompt={initialPromptData} // Pass null for add mode, prompt data for edit
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                onDelete={isEditMode ? handleDelete : undefined} // Only pass delete handler in edit mode
                isEditMode={isEditMode}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: Colors.error,
        marginBottom: 10,
    }
});

export default PromptEditScreen; 