import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/constants';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.safeArea, style]}>
            <View style={styles.container}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.surface, // Use a light gray background
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
});

export default ScreenContainer; 