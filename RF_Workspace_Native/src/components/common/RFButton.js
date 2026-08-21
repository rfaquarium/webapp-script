import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

export default function RFButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'outline' | 'danger'
  loading = false,
  disabled = false,
  className = '',
  icon
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'outline':
        return 'bg-transparent border border-white/20';
      case 'danger':
        return 'bg-rose-500/10 border border-rose-500/30';
      default:
        return 'bg-[#d4af37] border border-[#d4af37]';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return 'text-white font-semibold';
      case 'danger':
        return 'text-rose-400 font-semibold';
      default:
        return 'text-[#09090b] font-semibold';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`h-12 flex-row items-center justify-center rounded-xl px-4 ${getVariantStyle()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#09090b' : '#d4af37'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`text-sm tracking-wide ${getTextStyle()}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
