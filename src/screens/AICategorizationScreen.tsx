import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { AICategorizationScreenProps } from '../navigation/types';
import { useSettings } from '../context/SettingsContext';
import { usePrompts } from '../hooks/usePrompts';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import CategorySuggestionItem from '../components/CategorySuggestionItem';
import { getCategorySuggestions } from '../utils/openaiApi';
import { Prompt } from '../types';
import { Colors, DEFAULT_MODEL_ID } from '../utils/constants';

// Interface combining prompt with suggestion state
interface PromptWithSuggestion extends Prompt {
    suggestedCategory?: string;
    useCategory: boolean; // Whether the checkbox is checked
}

const AICategorizationScreen: React.FC<AICategorizationScreenProps> = ({ navigation }) => {
    const {
        apiKey,
        selectedModelId,
        isLoading: settingsLoading
    } = useSettings();
    const { prompts, updatePrompt, isLoading: promptsLoading } = usePrompts();

    const [suggestions, setSuggestions] = useState<PromptWithSuggestion[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    // Initialize suggestions state when prompts load
    useEffect(() => {
        if (prompts.length > 0 && suggestions.length === 0) {
            setSuggestions(prompts.map(p => ({ ...p, useCategory: false })));
        }
    }, [prompts, suggestions.length]);

    const handleFetchSuggestions = useCallback(async () => {
        if (!apiKey) {
            Alert.alert(
                'API Key Missing',
                'Please add your OpenAI API key in the Settings screen first.',
                [{ text: 'OK', onPress: () => navigation.navigate('Settings') }]
            );
            return;
        }

        setIsFetching(true);
        setFetchError(null);
        try {
            const modelToUse = selectedModelId || DEFAULT_MODEL_ID;
            console.log(`Fetching suggestions using model: ${modelToUse}`);
            const result = await getCategorySuggestions(apiKey, prompts, modelToUse);
            if (result.success && result.suggestions) {
                // Map suggestions back to the local state
                setSuggestions(currentSuggestions =>
                    currentSuggestions.map(prompt => {
                        const suggestion = result.suggestions?.find(s => s.promptId === prompt.id);
                        return {
                            ...prompt,
                            suggestedCategory: suggestion?.category,
                            // Pre-check the box if a suggestion exists
                            useCategory: !!suggestion?.category,
                        };
                    })
                );
            } else {
                throw new Error(result.error?.message || 'Failed to fetch suggestions');
            }
        } catch (err) {
            console.error('Fetch suggestions error:', err);
            setFetchError(err instanceof Error ? err.message : 'An unknown error occurred');
            Alert.alert('Error', 'Could not fetch category suggestions. Please check your API key and network connection.');
        } finally {
            setIsFetching(false);
        }
    }, [apiKey, prompts, navigation, selectedModelId]);

    const handleToggleSelection = useCallback((id: string) => {
        setSuggestions(currentSuggestions =>
            currentSuggestions.map(p =>
                p.id === id ? { ...p, useCategory: !p.useCategory } : p
            )
        );
    }, []);

    const handleApplyCategories = useCallback(async () => {
        const promptsToUpdate = suggestions.filter(p => p.useCategory && p.suggestedCategory);
        if (promptsToUpdate.length === 0) {
            Alert.alert('No Changes', 'No categories selected to apply.');
            return;
        }

        setIsApplying(true);
        try {
            // Update prompts one by one (or batch if hook supports it)
            for (const promptToUpdate of promptsToUpdate) {
                if (promptToUpdate.suggestedCategory) { // Check again to satisfy TypeScript
                    await updatePrompt({
                        ...promptToUpdate,
                        category: promptToUpdate.suggestedCategory, // Apply the suggested category
                    });
                }
            }
            Alert.alert('Success', `${promptsToUpdate.length} prompt(s) updated successfully.`);
            navigation.goBack(); // Go back after applying
        } catch (err) {
            console.error('Apply categories error:', err);
            Alert.alert('Error', 'Failed to apply categories.');
        } finally {
            setIsApplying(false);
        }
    }, [suggestions, updatePrompt, navigation]);

    // Render loading state
    if (settingsLoading || promptsLoading) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    const renderSuggestionItem = ({ item }: { item: PromptWithSuggestion }) => (
        <CategorySuggestionItem item={item} onToggleSelection={handleToggleSelection} />
    );

    const numSelected = suggestions.filter(p => p.useCategory).length;

    return (
        <ScreenContainer>
            <Text style={styles.description}>
                Use your OpenAI API key to automatically suggest categories for your prompts.
            </Text>
            <Button
                title={isFetching ? 'Fetching...' : 'Fetch Category Suggestions'}
                onPress={handleFetchSuggestions}
                disabled={isFetching || isApplying || !prompts || prompts.length === 0}
                variant="primary"
                style={styles.actionButton}
            />

            {fetchError && <Text style={styles.errorText}>Error: {fetchError}</Text>}

            {prompts.length === 0 && !isFetching && (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Add some prompts first to categorize them.</Text>
                </View>
            )}

            {prompts.length > 0 && (
                <FlatList
                    data={suggestions}
                    renderItem={renderSuggestionItem}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    ListEmptyComponent={
                        !isFetching ? (
                            <View style={styles.centerContent}><Text>No prompts found.</Text></View>
                        ) : null
                    }
                />
            )}

            {suggestions.some(p => p.suggestedCategory) && (
                <View style={styles.footer}>
                    <Button
                        title={isApplying ? 'Applying...' : `Apply ${numSelected} Selected Categories`}
                        onPress={handleApplyCategories}
                        disabled={isApplying || isFetching || numSelected === 0}
                        variant="primary"
                    />
                </View>
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
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButton: {
        marginBottom: 16,
    },
    list: {
        flex: 1, // Allow list to take available space
        marginTop: 10,
    },
    errorText: {
        color: Colors.error,
        textAlign: 'center',
        marginVertical: 10,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
        marginTop: 10,
    },
});

export default AICategorizationScreen; 