import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    GestureResponderEvent,
    Alert,
} from 'react-native';
import { Prompt } from '../types';
import { Colors } from '../utils/constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Button from './Button'; // Import Button component
import { copyTextToClipboard } from '../utils/clipboard'; // Import the utility

interface PromptListItemProps {
    prompt: Prompt;
    onCopy: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    isFirst: boolean; // To disable move up
    isLast: boolean; // To disable move down
}

const PromptListItem: React.FC<PromptListItemProps> = ({
    prompt,
    onCopy,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}) => {
    // Placeholder for copy feedback - Step 17 will refine this
    const [copied, setCopied] = React.useState(false);

    const handleCopyToClipboard = async () => {
        const success = await copyTextToClipboard(prompt.text);
        if (success) {
            setCopied(true);
            onCopy(prompt.id);
            setTimeout(() => setCopied(false), 1500);
        } else {
            Alert.alert('Error', 'Could not copy text to clipboard.');
        }
    };

    const handleEdit = () => {
        onEdit(prompt.id);
    };

    const handleDelete = () => {
        onDelete(prompt.id);
    };

    const handleMoveUp = () => {
        onMoveUp(prompt.id);
    };

    const handleMoveDown = () => {
        onMoveDown(prompt.id);
    };

    const truncatedText = prompt.text.length > 80
        ? `${prompt.text.substring(0, 80)}...`
        : prompt.text;

    return (
        <View style={styles.itemContainer}>
            <View style={styles.mainContent}>
                <View style={styles.indicatorContainer}>
                    <View style={[styles.colorIndicator, { backgroundColor: prompt.color || Colors.primary }]} />
                    <MaterialCommunityIcons
                        name={(prompt.icon as any) || 'text-box-outline'}
                        size={20}
                        color={Colors.textSecondary}
                        style={styles.icon}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.promptName}>{prompt.name || 'Unnamed Prompt'}</Text>
                    <Text style={styles.promptText} numberOfLines={2}>{truncatedText}</Text>
                    {prompt.category && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{prompt.category}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionsContainer}>
                {/* Move Buttons */}
                <Button
                    iconName="arrow-up-bold-outline"
                    onPress={handleMoveUp}
                    disabled={isFirst}
                    variant="secondary"
                    style={styles.actionButton}
                />
                <Button
                    iconName="arrow-down-bold-outline"
                    onPress={handleMoveDown}
                    disabled={isLast}
                    variant="secondary"
                    style={styles.actionButton}
                />
                {/* Action Buttons */}
                <Button
                    iconName={copied ? 'check' : 'content-copy'}
                    onPress={handleCopyToClipboard}
                    variant={copied ? 'primary' : 'secondary'}
                    style={styles.actionButton}
                    disabled={copied}
                />
                <Button
                    iconName="pencil-outline"
                    onPress={handleEdit}
                    variant="secondary"
                    style={styles.actionButton}
                />
                <Button
                    iconName="delete-outline"
                    onPress={handleDelete}
                    variant="danger"
                    style={styles.actionButton}
                />
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
        elevation: 1, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    indicatorContainer: {
        alignItems: 'center',
        marginRight: 12,
    },
    colorIndicator: {
        width: 8,
        height: 40, // Make it taller
        borderRadius: 4,
        marginBottom: 4,
    },
    icon: {
        // Style for the icon if needed
    },
    textContainer: {
        flex: 1,
    },
    promptName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    promptText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    categoryBadge: {
        backgroundColor: Colors.surface,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 10,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
        paddingTop: 10,
        marginTop: 5,
    },
    actionButton: {
        paddingVertical: 6, // Smaller padding for action buttons
        paddingHorizontal: 10,
        marginLeft: 6,
    },
});

export default PromptListItem; 