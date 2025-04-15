import React, { useLayoutEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PromptListScreenProps } from '../navigation/types';
import { usePrompts } from '../hooks/usePrompts';
import PromptListItem from '../components/PromptListItem';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { Colors } from '../utils/constants';
import { Prompt } from '../types';

const PromptListScreen: React.FC<PromptListScreenProps> = ({ navigation }) => {
    const {
        prompts,
        isLoading,
        error,
        fetchPrompts,
        deletePrompt,
        reorderPrompt
    } = usePrompts();

    useFocusEffect(
        useCallback(() => {
            console.log("PromptListScreen focused, fetching prompts...");
            fetchPrompts();

            return () => {
                // console.log("PromptListScreen blurred");
            };
        }, [fetchPrompts])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <Button
                        iconName="plus-circle-outline"
                        onPress={() => navigation.navigate({ name: 'PromptEdit', params: {} })}
                        style={styles.headerButton}
                        iconColor={Colors.primary}
                    />
                    <Button
                        iconName="cog-outline"
                        onPress={() => navigation.navigate('Settings')}
                        style={styles.headerButton}
                        iconColor={Colors.primary}
                    />
                    <Button
                        iconName="swap-horizontal-bold"
                        onPress={() => navigation.navigate('ImportExport')}
                        style={styles.headerButton}
                        iconColor={Colors.primary}
                    />
                </View>
            ),
        });
    }, [navigation]);

    const handleEdit = useCallback((id: string) => {
        navigation.navigate('PromptEdit', { promptId: id });
    }, [navigation]);

    const handleDelete = useCallback((id: string) => {
        Alert.alert(
            'Delete Prompt',
            'Are you sure you want to delete this prompt?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await deletePrompt(id);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete prompt.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    }, [deletePrompt]);

    const handleCopy = useCallback((id: string) => {
        console.log('Copy requested for:', id);
    }, []);

    const handleMoveUp = useCallback((id: string) => {
        reorderPrompt(id, 'up');
    }, [reorderPrompt]);

    const handleMoveDown = useCallback((id: string) => {
        reorderPrompt(id, 'down');
    }, [reorderPrompt]);

    const renderItem = ({ item, index }: { item: Prompt; index: number }) => (
        <PromptListItem
            prompt={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={index === 0}
            isLast={index === prompts.length - 1}
        />
    );

    if (isLoading && prompts.length === 0) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ScreenContainer>
        );
    }

    if (error) {
        return (
            <ScreenContainer style={styles.centerContent}>
                <Text style={styles.errorText}>Error loading prompts: {error}</Text>
                <Button title="Retry" onPress={fetchPrompts} variant="primary" />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            {prompts.length === 0 && !isLoading ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>No prompts added yet.</Text>
                    <Text style={styles.emptySubText}>Tap the '+' icon to add your first prompt.</Text>
                </View>
            ) : (
                <FlatList
                    data={prompts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    extraData={prompts}
                />
            )}
            {isLoading && prompts.length > 0 && (
                <View style={styles.loadingMoreIndicator}>
                    <ActivityIndicator size="small" color={Colors.textSecondary} />
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
    errorText: {
        color: Colors.error,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 16,
    },
    headerButtons: {
        flexDirection: 'row',
        marginRight: 10,
    },
    headerButton: {
        marginLeft: 15,
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    loadingMoreIndicator: {
        paddingVertical: 10,
        alignItems: 'center',
    },
});

export default PromptListScreen; 