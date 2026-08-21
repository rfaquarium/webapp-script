import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import ScreenContainer from '../components/common/ScreenContainer';
import OrderFilterBar from '../components/orders/OrderFilterBar';
import OrderCard from '../components/orders/OrderCard';
import { apiGetAppData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrdersScreen({ setIsMenuOpen }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeChannel, setActiveChannel] = useState('all');
  const [activeStatus, setActiveStatus] = useState('wait_prod');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pin = await AsyncStorage.getItem('rf_pin');
      const res = await apiGetAppData(pin);
      if (res && res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.log('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Custom Header matching Web App */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-4 border-b border-[#27272a]">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => setIsMenuOpen && setIsMenuOpen(true)} className="p-1">
            <FontAwesome5 name="bars" size={18} color="#a1a1aa" />
          </TouchableOpacity>
          <View>
            <Text className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Hệ thống nội bộ</Text>
            <Text className="text-white text-base font-semibold tracking-tight">Workspace Pro</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-8 h-8 border border-[#d4af37]/40 bg-[#d4af37]/10 rounded-lg items-center justify-center">
            <FontAwesome5 name="bell-slash" size={12} color="#d4af37" />
          </TouchableOpacity>
          <View className="relative">
            <View className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 items-center justify-center overflow-hidden">
              <FontAwesome5 name="user" size={12} color="#d4af37" />
            </View>
            <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-[#09090b]" />
          </View>
        </View>
      </View>

      {/* Action Buttons & Search */}
      <View className="px-4 py-4 border-b border-[#27272a] space-y-4">
        {/* Actions */}
        <View className="flex-row gap-2.5">
          {['plus', 'file-alt', 'history', 'check-double', 'ban', 'chart-bar'].map((icon, i) => (
            <TouchableOpacity key={i} className={`w-9 h-9 rounded-full border items-center justify-center active:bg-zinc-800 ${
              i === 0 ? 'border-[#d4af37]/40 bg-[#d4af37]/10' : 'border-[#27272a] bg-[#18181b]'
            }`}>
              <FontAwesome5 name={icon} size={12} color={i === 0 ? '#d4af37' : '#a1a1aa'} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Search */}
        <View className="flex-row gap-2">
          <View className="flex-1 h-10 bg-[#121214] border border-[#27272a] rounded-xl flex-row items-center px-3">
            <TextInput 
              placeholder="Tìm mã đơn, khách hàng..." 
              placeholderTextColor="#71717a"
              className="flex-1 text-white text-xs font-medium"
            />
          </View>
          <TouchableOpacity className="h-10 bg-[#121214] border border-[#27272a] rounded-xl px-4 flex-row items-center justify-center gap-2 active:bg-zinc-800">
            <Text className="text-white text-xs font-semibold">Tháng Này</Text>
            <FontAwesome5 name="chevron-down" size={10} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View className="pt-4 pb-2 border-b border-[#27272a]">
        <OrderFilterBar 
          activeChannel={activeChannel} setActiveChannel={setActiveChannel}
          activeStatus={activeStatus} setActiveStatus={setActiveStatus}
        />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#d4af37" className="mt-10" />
        ) : (
          <>
            {/* Group Header */}
            <View className="flex-row items-center justify-between bg-[#121214] border border-[#27272a] rounded-xl p-3 mb-4 border-l-[3px] border-l-[#ea580c] shadow-lg">
              <View className="flex-row items-center gap-2.5">
                <FontAwesome5 name="layer-group" size={12} color="#a1a1aa" />
                <Text className="text-white text-[13px] font-semibold uppercase tracking-widest">SHOPEE VN</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity className="flex-row items-center gap-2 active:opacity-70">
                  <View className="w-4 h-4 rounded border border-white/30 items-center justify-center bg-white/5" />
                  <Text className="text-white text-[10px] font-semibold tracking-widest">CHỌN TẤT CẢ</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center gap-1.5 active:opacity-70 bg-[#18181b] px-2 py-1 rounded-md border border-[#27272a]">
                  <Text className="text-white text-[10px] font-semibold tracking-widest">1 ĐƠN</Text>
                  <FontAwesome5 name="chevron-up" size={10} color="#a1a1aa" />
                </TouchableOpacity>
              </View>
            </View>

            {orders.length > 0 ? (
              orders.map((item, index) => (
                <OrderCard key={item.id || index} order={item} index={index} />
              ))
            ) : (
              <OrderCard order={{}} index={0} />
            )}
            <View className="h-24" />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
