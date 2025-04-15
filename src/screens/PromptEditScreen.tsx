import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Alert,
    View,
    Text,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    LayoutChangeEvent,
} from 'react-native';
import { PromptEditScreenProps } from '../navigation/types';
import { usePrompts } from '../hooks/usePrompts';
import PromptForm from '../components/PromptForm';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { Prompt } from '../types';
import { Colors, DEFAULT_MODEL_ID } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';
import { enhancePrompt, EnhancementHistoryItem } from '../utils/openaiApi';

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

    const { apiKey, selectedModelId, isLoading: settingsLoading } = useSettings();

    const [isLoadingPrompt, setIsLoadingPrompt] = useState(isEditMode);
    const [formData, setFormData] = useState<Prompt | Omit<Prompt, 'id'> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [enhancerPreview, setEnhancerPreview] = useState<string | null>(null);
    const [enhancerFeedback, setEnhancerFeedback] = useState<string>('');
    const [enhancerHistory, setEnhancerHistory] = useState<EnhancementHistoryItem[]>([]);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    const [enhancerError, setEnhancerError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            if (!promptsLoading && prompts.length > 0) {
                const foundPrompt = prompts.find(p => p.id === promptId);
                setFormData(foundPrompt || null);
                setIsLoadingPrompt(false);
            }
        } else {
            setFormData({ name: '', text: '', category: '', color: Colors.primary, icon: 'text-box-outline' });
            setIsLoadingPrompt(false);
        }
    }, [isEditMode, promptId, promptsLoading, prompts]);

    const handleNameChange = useCallback((newName: string) => {
        setFormData(prevData => {
            if (!prevData) return null;
            if ('id' in prevData) {
                return { ...prevData, name: newName };
            } else {
                return { ...prevData, name: newName };
            }
        });
    }, []);

    const handleTextChange = useCallback((newText: string) => {
        setFormData(prevData => {
            if (!prevData) return null;
            if ('id' in prevData) {
                return { ...prevData, text: newText };
            } else {
                return { ...prevData, text: newText };
            }
        });
        if (enhancerPreview) {
            setEnhancerPreview(null);
            setEnhancerFeedback('');
            setEnhancerHistory([]);
            setEnhancerError(null);
        }
    }, [enhancerPreview]);

    const handleFormSubmit = async (submittedData: Omit<Prompt, 'id'> | Prompt) => {
        if (!submittedData.text?.trim()) {
            Alert.alert('Error', 'Prompt text cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updatePrompt(submittedData as Prompt);
            } else {
                await addPrompt(submittedData as Omit<Prompt, 'id'>);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} prompt.`);
            console.error('Prompt save error:', error);
            setIsSubmitting(false);
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
                    style: 'destructive',
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            await deletePrompt(id);
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete prompt.');
                            setIsSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEnhance = useCallback(async () => {
        const currentText = formData?.text || '';
        if (!apiKey || settingsLoading) {
            Alert.alert('API Key Needed', 'Please set your OpenAI API key in Settings to use the enhancer.');
            return;
        }
        if (!currentText.trim()) {
            Alert.alert('Input Needed', 'Please enter some initial prompt text to enhance.');
            return;
        }

        setIsEnhancing(true);
        setEnhancerError(null);
        setEnhancerPreview(null);
        setEnhancerHistory([]);

        const modelToUse = selectedModelId || DEFAULT_MODEL_ID;

        try {
            const result = await enhancePrompt(apiKey, modelToUse, currentText);
            if (result.success && result.enhancedPrompt) {
                setEnhancerPreview(result.enhancedPrompt);
                setEnhancerHistory([
                    {
                        role: 'user', content: `Original Prompt: "${currentText}"
Please enhance this prompt.` },
                    { role: 'assistant', content: result.enhancedPrompt }
                ]);
            } else {
                throw new Error(result.error?.message || 'Failed to enhance prompt');
            }
        } catch (err) {
            console.error('Enhance error:', err);
            setEnhancerError(err instanceof Error ? err.message : 'An unknown error occurred');
            Alert.alert('Enhancement Error', `Failed to get enhancement: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsEnhancing(false);
        }
    }, [formData, apiKey, selectedModelId, settingsLoading]);

    const handleRegenerate = useCallback(async () => {
        if (!apiKey || !enhancerPreview) {
            Alert.alert('Error', 'Cannot regenerate without an API key and a previous suggestion.');
            return;
        }
        if (!enhancerFeedback.trim()) {
            Alert.alert('Input Needed', 'Please provide feedback for regeneration.');
            return;
        }

        setIsEnhancing(true);
        setEnhancerError(null);

        const modelToUse = selectedModelId || DEFAULT_MODEL_ID;
        const promptToRegenerate = enhancerPreview;

        try {
            const result = await enhancePrompt(apiKey, modelToUse, promptToRegenerate, enhancerHistory, enhancerFeedback);
            if (result.success && result.enhancedPrompt) {
                setEnhancerPreview(result.enhancedPrompt);
                setEnhancerHistory(prev => [
                    ...prev,
                    { role: 'user', content: `User Feedback for this iteration: "${enhancerFeedback}"` },
                    { role: 'assistant', content: result.enhancedPrompt || '' }
                ]);
                setEnhancerFeedback('');
            } else {
                throw new Error(result.error?.message || 'Failed to regenerate prompt');
            }
        } catch (err) {
            console.error('Regenerate error:', err);
            setEnhancerError(err instanceof Error ? err.message : 'An unknown error occurred');
            Alert.alert('Regeneration Error', `Failed to regenerate: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsEnhancing(false);
        }
    }, [apiKey, selectedModelId, enhancerPreview, enhancerFeedback, enhancerHistory]);

    const handleAcceptSuggestion = useCallback(() => {
        if (enhancerPreview) {
            setFormData(prevData => {
                const baseData: Omit<Prompt, 'id'> = {
                    name: prevData?.name ?? '',
                    text: enhancerPreview,
                    category: prevData?.category ?? '',
                    color: prevData?.color ?? Colors.primary,
                    icon: prevData?.icon ?? 'text-box-outline',
                };
                return baseData;
            });
            setEnhancerPreview(null);
            setEnhancerFeedback('');
            setEnhancerHistory([]);
            setEnhancerError(null);
        }
    }, [enhancerPreview]);

    if (isLoadingPrompt || settingsLoading || (isEditMode && formData === undefined)) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    if (isEditMode && formData === null) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <Text style={styles.errorText}>Error: Prompt not found.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" />
            </ScreenContainer>
        );
    }

    if (!isEditMode && formData === null) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <Text style={styles.errorText}>Error initializing form data.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            {formData && (
                <PromptForm
                    initialPrompt={formData as Prompt | null}
                    name={formData.name || ''}
                    onNameChange={handleNameChange}
                    text={formData.text || ''}
                    onTextChange={handleTextChange}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    onDelete={isEditMode && formData && 'id' in formData ? handleDelete : undefined}
                    isEditMode={isEditMode}
                    enhancerProps={!isEditMode ? {
                        apiKey: apiKey,
                        settingsLoading: settingsLoading,
                        enhancerPreview: enhancerPreview,
                        isEnhancing: isEnhancing,
                        enhancerError: enhancerError,
                        enhancerFeedback: enhancerFeedback,
                        onEnhancerFeedbackChange: setEnhancerFeedback,
                        onEnhance: handleEnhance,
                        onRegenerate: handleRegenerate,
                        onAcceptSuggestion: handleAcceptSuggestion,
                    } : undefined}
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: Colors.error,
        marginBottom: 10,
        textAlign: 'center',
        marginHorizontal: 15,
    },
    scrollContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
});

export default PromptEditScreen; 