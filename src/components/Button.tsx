import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../utils/constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps {
    title?: string; // Optional title, can use icon only
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconName?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    iconSize?: number;
    iconColor?: string;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    style,
    textStyle,
    iconName,
    iconSize = 18,
    iconColor
}) => {

    const getButtonStyles = () => {
        const baseStyle: ViewStyle = styles.base;
        const baseTextStyle: TextStyle = styles.textBase;
        let variantStyle: ViewStyle = {};
        let variantTextStyle: TextStyle = {};

        switch (variant) {
            case 'primary':
                variantStyle = styles.primary;
                variantTextStyle = styles.textPrimary;
                break;
            case 'secondary':
                variantStyle = styles.secondary;
                variantTextStyle = styles.textSecondary;
                break;
            case 'danger':
                variantStyle = styles.danger;
                variantTextStyle = styles.textDanger;
                break;
            case 'outline':
                variantStyle = styles.outline;
                variantTextStyle = styles.textOutline;
                break;
        }

        if (disabled) {
            variantStyle = styles.disabled;
            variantTextStyle = styles.textDisabled;
        }

        // Determine icon color based on variant and disabled state
        const finalIconColor = iconColor || (disabled
            ? Colors.disabled
            : variant === 'primary' || variant === 'danger' ? Colors.background
                : Colors.primary);

        return {
            button: [baseStyle, variantStyle, style],
            text: [baseTextStyle, variantTextStyle, textStyle],
            iconColor: finalIconColor
        };
    };

    const { button, text, iconColor: finalIconColor } = getButtonStyles();

    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} style={button}>
            {iconName && (
                <MaterialCommunityIcons
                    name={iconName}
                    size={iconSize}
                    color={finalIconColor}
                    style={title ? styles.iconWithText : styles.iconOnly} // Add margin if text is present
                />
            )}
            {title && <Text style={text}>{title}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textBase: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    primary: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    textPrimary: {
        color: Colors.background,
    },
    secondary: {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
    },
    textSecondary: {
        color: Colors.text,
    },
    danger: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    textDanger: {
        color: Colors.background,
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: Colors.primary,
    },
    textOutline: {
        color: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.disabledBackground,
        borderColor: Colors.disabledBackground,
    },
    textDisabled: {
        color: Colors.disabled,
    },
    iconWithText: {
        marginRight: 8,
    },
    iconOnly: {
        marginRight: 0,
    }
});

export default Button; 