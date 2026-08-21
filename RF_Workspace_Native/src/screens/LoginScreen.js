import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiValidatePin } from '../services/api';
import ScreenContainer from '../components/common/ScreenContainer';

export default function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePress = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    
    try {
      const res = await apiValidatePin(pin);
      
      if (res && res.success && res.data && res.data.valid) {
        // Fallback for different object structures from Google Apps Script
        const d = res.data;
        const u = d.user || d.Tên_Nhân_Sự || 'User';
        const r = d.role || d.Chức_Danh || '';
        const a = d.isAdmin || d.admin || false;
        const b = d.isBoss || d.boss || false;

        await AsyncStorage.setItem('rf_pin', pin);
        await AsyncStorage.setItem('rf_user', u);
        await AsyncStorage.setItem('rf_role', r);
        await AsyncStorage.setItem('rf_admin', String(a));
        await AsyncStorage.setItem('rf_boss', String(b));

        onLogin(u, a, b, r);
      } else {
        Alert.alert('Lỗi Đăng Nhập', res.message || 'Mã PIN không chính xác hoặc không có quyền truy cập.');
        setPin('');
      }
    } catch (err) {
      Alert.alert('Lỗi Kết Nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="justify-center items-center px-6">
      {/* Brand Header */}
      <View className="items-center mb-10">
        <View className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 items-center justify-center mb-4">
          <FontAwesome5 name="crown" size={24} color="#d4af37" />
        </View>
        <Text className="text-white font-semibold text-2xl tracking-widest uppercase mb-1">
          Workspace Pro
        </Text>
        <Text className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">
          Hệ thống điều hành nội bộ
        </Text>
      </View>

      {/* PIN Display */}
      <View className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-sm p-6 items-center shadow-lg mb-8">
        <Text className="text-zinc-500 font-semibold text-xs tracking-widest uppercase mb-4">
          Nhập mã PIN của bạn
        </Text>
        <View className="flex-row gap-4 mb-2 h-10 items-center">
          {[...Array(6)].map((_, i) => (
            <View 
              key={i} 
              className={`w-4 h-4 rounded-full border ${
                i < pin.length 
                  ? 'bg-[#d4af37] border-[#d4af37]' 
                  : 'bg-transparent border-zinc-700'
              }`}
            />
          ))}
        </View>
        {loading && (
          <View className="absolute bottom-[-30px]">
            <ActivityIndicator color="#d4af37" size="small" />
          </View>
        )}
      </View>

      {/* Numpad */}
      <View className="w-full max-w-sm">
        <View className="flex-row justify-between mb-4">
          {[1, 2, 3].map(num => (
            <TouchableOpacity 
              key={num} onPress={() => handlePress(num.toString())} disabled={loading}
              className="w-[30%] aspect-square bg-[#18181b] border border-white/5 rounded-2xl items-center justify-center active:bg-[#27272a]"
            >
              <Text className="text-white text-3xl font-light">{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row justify-between mb-4">
          {[4, 5, 6].map(num => (
            <TouchableOpacity 
              key={num} onPress={() => handlePress(num.toString())} disabled={loading}
              className="w-[30%] aspect-square bg-[#18181b] border border-white/5 rounded-2xl items-center justify-center active:bg-[#27272a]"
            >
              <Text className="text-white text-3xl font-light">{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row justify-between mb-4">
          {[7, 8, 9].map(num => (
            <TouchableOpacity 
              key={num} onPress={() => handlePress(num.toString())} disabled={loading}
              className="w-[30%] aspect-square bg-[#18181b] border border-white/5 rounded-2xl items-center justify-center active:bg-[#27272a]"
            >
              <Text className="text-white text-3xl font-light">{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity 
            onPress={handleDelete} disabled={loading || pin.length === 0}
            className="w-[30%] aspect-square bg-[#18181b] border border-white/5 rounded-2xl items-center justify-center active:bg-[#27272a]"
          >
            <FontAwesome5 name="backspace" size={24} color={pin.length > 0 ? "#a1a1aa" : "#3f3f46"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePress('0')} disabled={loading}
            className="w-[30%] aspect-square bg-[#18181b] border border-white/5 rounded-2xl items-center justify-center active:bg-[#27272a]"
          >
            <Text className="text-white text-3xl font-light">0</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSubmit} disabled={loading || pin.length === 0}
            className={`w-[30%] aspect-square rounded-2xl items-center justify-center active:opacity-80 ${
              pin.length > 0 ? 'bg-[#d4af37] shadow-lg' : 'bg-[#18181b] border border-white/5'
            }`}
          >
            <FontAwesome5 name="arrow-right" size={24} color={pin.length > 0 ? "#000000" : "#3f3f46"} />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
