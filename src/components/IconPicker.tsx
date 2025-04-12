import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Text,
    ScrollView,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { Colors, availableIcons } from '../utils/constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Button from './Button'; // For the close button

interface IconPickerProps {
    currentIcon: string;
    onSelectIcon: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelectIcon }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (icon: string) => {
        onSelectIcon(icon);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Icon</Text>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name={(currentIcon as any) || 'help-circle-outline'} // Default icon if none selected
                    size={24}
                    color={Colors.text}
                    style={styles.selectedIconDisplay}
                />
                <Text style={styles.pickerButtonText}>{currentIcon || 'Select Icon'}</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select an Icon</Text>
                        <Button
                            iconName="close"
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                            variant="secondary"
                        />
                    </View>
                    <ScrollView contentContainerStyle={styles.iconGrid}>
                        {availableIcons.map((icon) => (
                            <Pressable
                                key={icon}
                                style={({ pressed }) => [
                                    styles.iconOption,
                                    currentIcon === icon && styles.selectedIconOption,
                                    pressed && styles.pressedIconOption, // Add pressed style
                                ]}
                                onPress={() => handleSelect(icon)}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={30}
                                    color={currentIcon === icon ? Colors.primary : Colors.textSecondary}
                                />
                            </Pressable>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    selectedIconDisplay: {
        marginRight: 10,
    },
    pickerButtonText: {
        fontSize: 16,
        color: Colors.text,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    closeButton: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
    },
    iconOption: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    selectedIconOption: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '1A', // Light primary background
    },
    pressedIconOption: {
        backgroundColor: Colors.border,
    },
});

export default IconPicker; 