import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../components/common/ScreenContainer';
import WorkerCardNative from '../components/production/WorkerCardNative';
import { apiGetAppData, apiSyncDeltas } from '../services/api';

const CHANNELS = [
  { id: 'all', label: 'Tất Cả', icon: 'server' },
  { id: 'shopee', label: 'Shopee', icon: 'shopping-bag' },
  { id: 'export', label: 'Xuất Khẩu', icon: 'globe-asia' },
  { id: 'tiktok', label: 'TikTok', icon: 'video' },
  { id: 'retail', label: 'Bán Lẻ', icon: 'store' },
];

const STATUSES = [
  { id: 'wait_prod', label: 'Chờ Sản Xuất', count: 7, icon: 'tools' },
  { id: 'qc', label: 'Kiểm Định', count: 0, icon: 'clipboard-check' },
  { id: 'done', label: 'Đã Xong', count: 86, icon: 'check-double' },
];

export default function ProductionScreen({ setIsMenuOpen }) {
  const [activeChannel, setActiveChannel] = useState('all');
  const [activeStatus, setActiveStatus] = useState('wait_prod');
  const [typeTab, setTypeTab] = useState('Layout'); // 'Layout' | 'Bể Kính'
  
  const [loading, setLoading] = useState(true);
  const [prodItems, setProdItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userConfigs, setUserConfigs] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const pin = await AsyncStorage.getItem('rf_pin');
      const user = await AsyncStorage.getItem('rf_user');
      const admin = await AsyncStorage.getItem('rf_admin');
      if (user) setCurrentUser(user);
      if (admin === 'true') setIsAdmin(true);

      const res = await apiGetAppData(pin);
      if (res && res.success && res.data) {
        setProdItems(res.data.prodItems || []);
        setOrders(res.data.orders || []);
        setUserConfigs(res.data.userConfig || {});
      }
    } catch (error) {
      console.log('Error fetching production data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDelta = async (delta) => {
    // Optimistic UI Update
    if (delta.updates?.prodItems) {
      setProdItems(prev => {
        let newItems = [...prev];
        delta.updates.prodItems.forEach(updateItem => {
          const idx = newItems.findIndex(i => i.id === updateItem.id);
          if (idx !== -1) {
            newItems[idx] = { ...newItems[idx], ...updateItem };
          }
        });
        return newItems;
      });
    }

    try {
      const pin = await AsyncStorage.getItem('rf_pin');
      const res = await apiSyncDeltas(delta, pin);
      if (!res.success) {
        Alert.alert('Lỗi Đồng Bộ', res.message || 'Không thể đồng bộ dữ liệu. Vui lòng thử lại!');
        loadData(); // Revert on failure
      }
    } catch (err) {
      Alert.alert('Lỗi Mạng', 'Không thể kết nối đến máy chủ.');
      loadData();
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 pb-1">
          {/* Stats Card */}
          <View className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 shadow-lg mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 bg-[#d4af37] rounded-full border-2 border-white/10" />
                <Text className="text-white text-sm font-semibold tracking-widest uppercase">Bảng Báo Cáo Sản Lượng</Text>
              </View>
              <View className="bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                <Text className="text-white text-[9px] font-semibold">Tháng Này</Text>
              </View>
            </View>
            
            <TouchableOpacity className="flex-row items-center gap-2 mb-5">
              <FontAwesome5 name="chart-line" size={10} color="#d4af37" />
              <Text className="text-white text-[11px] font-semibold tracking-widest uppercase">Xem chi tiết v</Text>
            </TouchableOpacity>

            {/* Type Switcher */}
            <View className="flex-row items-center bg-[#09090b] rounded-xl border border-[#27272a] p-1.5 h-14">
              <TouchableOpacity 
                onPress={() => setTypeTab('Bể Kính')}
                className={`flex-1 h-full items-center justify-center flex-row gap-2 rounded-lg ${typeTab === 'Bể Kính' ? 'bg-[#d4af37] shadow-lg' : ''}`}
              >
                <Text className={`text-[13px] font-semibold tracking-widest ${typeTab === 'Bể Kính' ? 'text-black' : 'text-zinc-500'}`}>BỂ KÍNH</Text>
                <View className={`px-2 py-0.5 rounded-full ${typeTab === 'Bể Kính' ? 'bg-black/20' : 'bg-[#18181b]'}`}>
                  <Text className={`text-[10px] font-semibold ${typeTab === 'Bể Kính' ? 'text-black' : 'text-zinc-400'}`}>218</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setTypeTab('Layout')}
                className={`flex-1 h-full items-center justify-center flex-row gap-2 rounded-lg ${typeTab === 'Layout' ? 'bg-[#d4af37] shadow-lg' : ''}`}
              >
                <Text className={`text-[13px] font-semibold tracking-widest ${typeTab === 'Layout' ? 'text-black' : 'text-zinc-500'}`}>LAYOUT</Text>
                <View className={`px-2 py-0.5 rounded-full ${typeTab === 'Layout' ? 'bg-black/20' : 'bg-[#18181b]'}`}>
                  <Text className={`text-[10px] font-semibold ${typeTab === 'Layout' ? 'text-black' : 'text-zinc-400'}`}>93</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Row */}
          <View className="flex-row gap-2.5 mb-4 items-center">
            <TouchableOpacity className="w-12 h-12 bg-[#d4af37] rounded-full items-center justify-center shadow-lg active:opacity-80">
              <FontAwesome5 name="plus" size={16} color="black" />
            </TouchableOpacity>
            <View className="flex-1 h-12 bg-[#121214] border border-[#27272a] rounded-xl flex-row items-center px-4 shadow-sm">
              <TextInput 
                placeholder="Tìm tên hàng, mã đơn..." 
                placeholderTextColor="#71717a"
                className="flex-1 text-white text-[13px] font-medium"
              />
            </View>
            <TouchableOpacity className="h-12 bg-[#121214] border border-[#27272a] rounded-xl px-4 flex-row items-center justify-center gap-2 shadow-sm active:bg-zinc-800">
              <Text className="text-white text-xs font-semibold">Tháng Này</Text>
              <FontAwesome5 name="chevron-down" size={10} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View className="mb-2">
            {/* Channels */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {CHANNELS.map(ch => {
                const isActive = activeChannel === ch.id;
                return (
                  <TouchableOpacity
                    key={ch.id}
                    onPress={() => setActiveChannel(ch.id)}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border mr-2 ${
                      isActive ? 'bg-[#d4af37]/10 border-[#d4af37]/40' : 'bg-[#121214] border-[#27272a]'
                    }`}
                  >
                    <FontAwesome5 name={ch.icon} size={11} color={isActive ? '#d4af37' : '#71717a'} />
                    <Text className={`ml-2 text-[11px] font-semibold tracking-widest uppercase ${isActive ? 'text-[#d4af37]' : 'text-zinc-400'}`}>
                      {ch.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Statuses */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {STATUSES.map(st => {
                const isActive = activeStatus === st.id;
                return (
                  <TouchableOpacity
                    key={st.id}
                    onPress={() => setActiveStatus(st.id)}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border mr-2 ${
                      isActive ? 'border-[#d4af37]/50 bg-[#d4af37]/10' : 'bg-[#121214] border-[#27272a]'
                    }`}
                  >
                    <FontAwesome5 name={st.icon} size={11} color={isActive ? '#d4af37' : '#71717a'} />
                    <Text className={`ml-2 text-[11px] font-semibold tracking-widest uppercase ${isActive ? 'text-[#d4af37]' : 'text-zinc-400'}`}>
                      {st.label}
                    </Text>
                    <View className={`ml-2 px-2 py-0.5 rounded-full ${isActive ? 'bg-[#d4af37]' : 'bg-[#27272a]'}`}>
                      <Text className={`text-[9px] font-semibold ${isActive ? 'text-black' : 'text-zinc-400'}`}>
                        {st.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Group Header */}
          <View className="flex-row items-center justify-between bg-[#121214] border border-[#27272a] rounded-xl p-4 mb-4 border-l-4 border-l-purple-600 shadow-lg">
            <View className="flex-row items-center gap-3">
              <FontAwesome5 name="layer-group" size={14} color="#a1a1aa" />
              <Text className="text-white text-[13px] font-semibold uppercase tracking-widest">SẢN XUẤT TỒN</Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-2 active:opacity-70 bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a]">
              <Text className="text-white text-[11px] font-semibold tracking-widest">7 LỆNH</Text>
              <FontAwesome5 name="chevron-up" size={10} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Render Cards dynamically */}
          {loading ? (
            <ActivityIndicator size="large" color="#d4af37" className="mt-10" />
          ) : (
            prodItems && prodItems.length > 0 ? (
              prodItems.map((item, index) => {
                const order = orders.find(o => o.id === item.orderId) || {};
                return (
                  <WorkerCardNative 
                    key={item.id || index} 
                    item={item} 
                    order={order} 
                    typeTab={typeTab}
                    userConfigs={userConfigs}
                    currentUser={currentUser}
                    isAdmin={isAdmin}
                    updateDeltas={handleUpdateDelta}
                  />
                );
              })
            ) : (
              <View className="items-center justify-center py-10 opacity-50">
                <FontAwesome5 name="clipboard" size={40} color="#71717a" />
                <Text className="text-zinc-400 font-semibold mt-4">Không có lệnh sản xuất nào</Text>
              </View>
            )
          )}
          
          <View className="h-24" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
