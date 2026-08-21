import React from 'react';
import { View } from 'react-native';

export default function RFCard({ children, className = '', elevated = false }) {
  return (
    <View 
      className={`rounded-2xl border border-white/10 p-4 ${
        elevated ? 'bg-[#18181b]' : 'bg-[#121214]'
      } ${className}`}
    >
      {children}
    </View>
  );
}
