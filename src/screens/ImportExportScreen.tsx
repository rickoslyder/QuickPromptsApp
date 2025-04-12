import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { ImportExportScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { usePrompts } from '../hooks/usePrompts';
import { exportPromptsToFile, importPromptsFromFile } from '../utils/fileSystem';
import { Colors } from '../utils/constants';

const ImportExportScreen: React.FC<ImportExportScreenProps> = ({ navigation }) => {
    const { prompts, replaceAllPrompts, mergePrompts, isLoading: promptsLoading, fetchPrompts } = usePrompts();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (prompts.length === 0) {
            Alert.alert('No Prompts', 'There are no prompts to export.');
            return;
        }
        setIsExporting(true);
        try {
            const result = await exportPromptsToFile(prompts);
            if (!result.success) {
                Alert.alert('Export Failed', result.error || 'An unknown error occurred during export.');
            }
            // Success feedback is implicitly handled by the share sheet appearing
        } catch (error) {
            console.error('Export button error:', error);
            Alert.alert('Export Error', 'An unexpected error occurred.');
        } finally {
            setIsExporting(false);
        }
    }, [prompts]);

    const handleImport = useCallback(async () => {
        setIsImporting(true);
        try {
            const result = await importPromptsFromFile();

            if (!result.success || !result.data) {
                if (result.error && result.error !== 'File selection cancelled.') {
                    // Show error only if it wasn't a user cancellation
                    Alert.alert('Import Failed', result.error);
                }
                setIsImporting(false);
                return;
            }

            const importedPrompts = result.data.prompts;
            const importCount = importedPrompts.length;

            Alert.alert(
                'Import Prompts',
                `Found ${importCount} prompt(s) in the file. How would you like to import them?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setIsImporting(false),
                    },
                    {
                        text: 'Merge (Add New)',
                        onPress: async () => {
                            try {
                                const mergedCount = await mergePrompts(importedPrompts);
                                await fetchPrompts();
                                Alert.alert('Merge Complete', `${mergedCount} new prompt(s) added.`);
                            } catch (e) {
                                Alert.alert('Merge Error', 'Failed to merge prompts.');
                            } finally {
                                setIsImporting(false);
                            }
                        },
                    },
                    {
                        text: 'Replace All',
                        style: 'destructive',
                        onPress: () => {
                            // Add another confirmation for destructive action
                            Alert.alert(
                                'Confirm Replace',
                                'This will delete all your current prompts and replace them with the imported ones. Are you sure?',
                                [
                                    { text: 'Cancel', style: 'cancel', onPress: () => setIsImporting(false) },
                                    {
                                        text: 'Replace',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await replaceAllPrompts(importedPrompts);
                                                await fetchPrompts();
                                                Alert.alert('Replace Complete', `${importCount} prompt(s) imported.`);
                                            } catch (e) {
                                                Alert.alert('Replace Error', 'Failed to replace prompts.');
                                            } finally {
                                                setIsImporting(false);
                                            }
                                        },
                                    },
                                ]
                            );
                        },
                    },
                ],
                { cancelable: false } // Prevent dismissing the alert by tapping outside
            );

        } catch (error) {
            console.error('Import button error:', error);
            Alert.alert('Import Error', 'An unexpected error occurred.');
            setIsImporting(false);
        }
        // Note: setIsImporting(false) is handled within the Alert callbacks for merge/replace
    }, [replaceAllPrompts, mergePrompts, fetchPrompts]);

    const isLoading = isExporting || isImporting || promptsLoading;

    return (
        <ScreenContainer>
            <ScrollView>
                <Text style={styles.title}>Import / Export Prompts</Text>
                <Text style={styles.description}>
                    You can export your prompts to a JSON file for backup or to transfer them to another device or the Chrome Extension. You can also import prompts from such a file.
                </Text>

                <View style={styles.buttonWrapper}>
                    <Button
                        title={isImporting ? 'Importing...' : 'Import from File'}
                        iconName="file-import-outline"
                        onPress={handleImport}
                        disabled={isLoading}
                        variant="primary"
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                        title={isExporting ? 'Exporting...' : 'Export to File'}
                        iconName="file-export-outline"
                        onPress={handleExport}
                        disabled={isLoading || prompts.length === 0}
                        variant="secondary"
                    />
                    {prompts.length === 0 && <Text style={styles.disabledText}>Add prompts to enable export.</Text>}
                </View>

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>
                            {isImporting ? 'Importing...' : isExporting ? 'Exporting...' : 'Loading...'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 32, // More space before buttons
        lineHeight: 20,
    },
    buttonWrapper: {
        marginBottom: 20,
    },
    disabledText: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover the screen
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure it's on top
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.primary,
    },
});

export default ImportExportScreen; 