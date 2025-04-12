import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors, defaultPromptColors } from '../utils/constants';

interface ColorPickerInputProps {
    currentColor: string;
    onSelectColor: (color: string) => void;
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ currentColor, onSelectColor }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.swatchContainer}>
                {defaultPromptColors.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.swatch,
                            { backgroundColor: color },
                            currentColor === color && styles.selectedSwatch, // Add border if selected
                        ]}
                        onPress={() => onSelectColor(color)}
                        activeOpacity={0.7}
                    />
                ))}
                {/* Basic support for a custom color (not a full picker) */}
                {/* Consider adding a library like 'react-native-color-picker' for a full spectrum picker */}
                {!defaultPromptColors.includes(currentColor) && (
                    <View style={[styles.swatch, { backgroundColor: currentColor }, styles.selectedSwatch]} />
                )}
            </View>
            {/* You could add a button here to open a modal with a more advanced color picker */}
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
    swatchContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10, // Use gap for spacing
    },
    swatch: {
        width: 30,
        height: 30,
        borderRadius: 15, // Make them circles
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedSwatch: {
        borderWidth: 2,
        borderColor: Colors.primary, // Highlight selected color
        transform: [{ scale: 1.1 }], // Slightly larger when selected
    },
});

export default ColorPickerInput; 