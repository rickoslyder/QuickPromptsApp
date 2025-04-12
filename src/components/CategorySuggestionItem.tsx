import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import Checkbox from 'expo-checkbox'; // Use expo-checkbox
import { Prompt } from '../types';
import { Colors } from '../utils/constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Extend Prompt to include suggestion and selection state
interface PromptWithSuggestion extends Prompt {
    suggestedCategory?: string;
    useCategory: boolean;
}

interface CategorySuggestionItemProps {
    item: PromptWithSuggestion;
    onToggleSelection: (id: string) => void;
}

const CategorySuggestionItem: React.FC<CategorySuggestionItemProps> = ({ item, onToggleSelection }) => {
    const truncatedText = item.text.length > 60
        ? `${item.text.substring(0, 60)}...`
        : item.text;

    const hasSuggestion = !!item.suggestedCategory;

    return (
        <View style={styles.itemContainer}>
            <View style={styles.promptInfo}>
                <MaterialCommunityIcons
                    name={(item.icon as any) || 'text-snippet'}
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.promptIcon}
                />
                <View style={styles.promptTextContainer}>
                    <Text style={styles.promptName}>{item.name || 'Unnamed Prompt'}</Text>
                    <Text style={styles.promptText} numberOfLines={1}>{truncatedText}</Text>
                </View>
            </View>

            <View style={styles.categoryInfo}>
                <View style={styles.categoryBox}>
                    <Text style={styles.categoryLabel}>Current:</Text>
                    <Text style={[styles.categoryValue, !item.category && styles.noCategory]}>
                        {item.category || 'None'}
                    </Text>
                </View>
                <MaterialCommunityIcons name="arrow-right-thin" size={20} color={Colors.textSecondary} style={styles.arrowIcon} />
                <View style={styles.categoryBox}>
                    <Text style={styles.categoryLabel}>Suggested:</Text>
                    <Text style={[styles.categoryValue, !hasSuggestion && styles.noCategory]}>
                        {item.suggestedCategory || '-'}
                    </Text>
                </View>
            </View>

            <View style={styles.checkboxContainer}>
                <Checkbox
                    value={item.useCategory}
                    onValueChange={() => onToggleSelection(item.id)}
                    color={item.useCategory ? Colors.primary : undefined}
                    disabled={!hasSuggestion} // Disable checkbox if there's no suggestion
                />
                <Text style={[styles.applyLabel, !hasSuggestion && styles.disabledLabel]}>Apply</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    promptInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Take up available space
        marginRight: 10,
    },
    promptIcon: {
        marginRight: 8,
    },
    promptTextContainer: {
        flex: 1, // Allow text to shrink if needed
    },
    promptName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    promptText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        minWidth: 160, // Ensure space for categories
    },
    categoryBox: {
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    categoryValue: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text,
        backgroundColor: Colors.surface,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        minWidth: 40, // Ensure minimum width
        textAlign: 'center',
    },
    noCategory: {
        fontStyle: 'italic',
        color: Colors.textSecondary,
        backgroundColor: 'transparent',
    },
    arrowIcon: {
        marginHorizontal: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    applyLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.text,
    },
    disabledLabel: {
        color: Colors.disabled,
    },
});

export default CategorySuggestionItem; 