import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenContainer({ children, className = '' }) {
  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <View className={`flex-1 bg-[#09090b] px-4 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
