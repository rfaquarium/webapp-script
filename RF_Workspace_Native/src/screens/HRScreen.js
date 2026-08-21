import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import ScreenContainer from '../components/common/ScreenContainer';
import AttendanceWidgetNative from '../components/hr/AttendanceWidgetNative';
import { apiGetAppData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import KPIModalNative from '../components/hr/KPIModalNative';

export default function HRScreen({ setIsMenuOpen }) {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [userConfigs, setUserConfigs] = useState({});
  const [showKPIModal, setShowKPIModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pin = await AsyncStorage.getItem('rf_pin');
      const res = await apiGetAppData(pin);
      if (res && res.success && res.data) {
        setAttendance(res.data.attendance || []);
        setUserConfigs(res.data.userConfig || {});
      }
    } catch (error) {
      console.log('Error fetching HR data', error);
    } finally {
      setLoading(false);
    }
  };

  const hrUsers = userConfigs?.users || [];

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
        <View className="p-4">
          
          {/* Top Actions Row */}
          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity 
              onPress={() => setShowKPIModal(true)}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-[#18181b] border border-[#d4af37]/30 rounded-xl active:bg-zinc-800 shadow-lg"
            >
              <FontAwesome5 name="plus-circle" size={12} color="#d4af37" />
              <Text className="text-[#d4af37] text-[11px] font-semibold tracking-widest uppercase">Tạo KPI</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-[#18181b] border border-[#10b981]/30 rounded-xl active:bg-zinc-800 shadow-lg">
              <FontAwesome5 name="tasks" size={12} color="#10b981" />
              <Text className="text-[#10b981] text-[11px] font-semibold tracking-widest uppercase">Giao Việc</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-[#18181b] border border-[#f43f5e]/30 rounded-xl active:bg-zinc-800 shadow-lg">
              <FontAwesome5 name="calendar-times" size={12} color="#f43f5e" />
              <Text className="text-[#f43f5e] text-[11px] font-semibold tracking-widest uppercase">Báo Nghỉ</Text>
            </TouchableOpacity>
          </View>

          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <FontAwesome5 name="clock" size={14} color="#38bdf8" />
              <Text className="text-white text-[13px] font-semibold uppercase tracking-widest">Theo dõi chấm công & nghỉ phép:</Text>
            </View>
            <View className="bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-1 rounded-md">
              <Text className="text-[#d4af37] text-[9px] font-semibold">Tháng Này</Text>
            </View>
          </View>

          {/* Sub Actions */}
          <View className="flex-row gap-2 mb-5">
            <TouchableOpacity className="flex-row items-center justify-center gap-2 py-2 px-4 bg-[#18181b] border border-[#27272a] rounded-lg active:bg-zinc-800 shadow-sm flex-1">
              <FontAwesome5 name="address-card" size={12} color="#a1a1aa" />
              <Text className="text-zinc-300 text-[11px] font-semibold tracking-widest uppercase">Danh Sách Thẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-center gap-2 py-2 px-4 bg-[#18181b] border border-[#27272a] rounded-lg active:bg-zinc-800 shadow-sm flex-1">
              <FontAwesome5 name="calendar-alt" size={12} color="#a1a1aa" />
              <Text className="text-zinc-300 text-[11px] font-semibold tracking-widest uppercase">Ma Trận Lịch Tháng</Text>
            </TouchableOpacity>
          </View>

          {/* Shift Widget */}
          <AttendanceWidgetNative attendance={attendance} />

          {/* Top Chuyên Cần */}
          <View className="mt-8 mb-6">
            <View className="items-center mb-6 z-10 relative">
              <View className="bg-[#09090b] px-4 py-1.5 rounded-full border border-zinc-700 flex-row items-center gap-2 absolute -top-3">
                <FontAwesome5 name="medal" size={10} color="#38bdf8" />
                <Text className="text-white text-[11px] font-semibold tracking-widest uppercase">Top Chuyên Cần</Text>
              </View>
              <View className="w-6 h-6 bg-[#38bdf8] rounded-full border-2 border-[#09090b] items-center justify-center absolute -top-8 shadow-xl shadow-blue-500/50">
                <FontAwesome5 name="star" size={10} color="white" />
              </View>
            </View>
            
            <View className="flex-row items-end justify-between bg-[#121214] border border-[#27272a] rounded-2xl p-4 pt-8">
              {/* Top 3 */}
              <View className="flex-1 items-center">
                <View className="w-12 h-12 rounded-full border-2 border-zinc-500 bg-[#18181b] items-center justify-center mb-2 overflow-hidden">
                  <Text className="text-zinc-300 font-semibold">{hrUsers[2] ? hrUsers[2].charAt(0) : '-'}</Text>
                </View>
                <Text className="text-white text-[11px] font-semibold tracking-widest uppercase mb-1" numberOfLines={1}>{hrUsers[2] ? hrUsers[2].split(' ').pop() : '...'}</Text>
                <Text className="text-zinc-400 text-[9px] font-semibold">131 giờ</Text>
                <View className="w-full h-1 mt-3 bg-zinc-600 rounded-full" />
              </View>
              {/* Top 1 */}
              <View className="flex-1 items-center px-2 bg-gradient-to-t from-[#38bdf8]/10 to-transparent pt-4 pb-2 rounded-xl border border-[#38bdf8]/30 mx-1 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                <View className="w-14 h-14 rounded-full border-2 border-[#38bdf8] bg-[#18181b] items-center justify-center mb-2 overflow-hidden shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                  <Text className="text-white font-semibold text-lg">{hrUsers[0] ? hrUsers[0].charAt(0) : '-'}</Text>
                </View>
                <Text className="text-[#38bdf8] text-[11px] font-semibold tracking-widest uppercase mb-1" numberOfLines={1}>{hrUsers[0] ? hrUsers[0].split(' ').pop() : '...'}</Text>
                <View className="bg-[#38bdf8] px-2 py-0.5 rounded-full mb-1">
                  <Text className="text-black text-[9px] font-semibold">273 giờ</Text>
                </View>
                <View className="w-full h-1 mt-2 bg-[#38bdf8] rounded-full shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
              </View>
              {/* Top 2 */}
              <View className="flex-1 items-center">
                <View className="w-12 h-12 rounded-full border-2 border-[#ea580c] bg-[#18181b] items-center justify-center mb-2 overflow-hidden">
                  <Text className="text-orange-400 font-semibold">{hrUsers[1] ? hrUsers[1].charAt(0) : '-'}</Text>
                </View>
                <Text className="text-white text-[11px] font-semibold tracking-widest uppercase mb-1" numberOfLines={1}>{hrUsers[1] ? hrUsers[1].split(' ').pop() : '...'}</Text>
                <Text className="text-zinc-400 text-[9px] font-semibold">118.3 giờ</Text>
                <View className="w-full h-1 mt-3 bg-[#ea580c] rounded-full" />
              </View>
            </View>
          </View>

          {/* Hồ Sơ Chấm Công Nhân Sự */}
          <View className="mb-8 border border-[#27272a] rounded-2xl p-4 bg-[#121214]">
            <Text className="text-zinc-400 text-[11px] font-semibold tracking-widest uppercase mb-4">Hồ sơ chấm công nhân sự</Text>
            
            {hrUsers.map((uName, idx) => {
              const uTitle = userConfigs?.titles?.[uName] || 'Nhân sự';
              const isManager = String(uTitle).toLowerCase().includes('founder') || String(uTitle).toLowerCase().includes('quản lý');
              const bgColor = isManager ? 'bg-emerald-900/30' : 'bg-sky-900/30';
              const textColor = isManager ? 'text-emerald-400' : 'text-sky-400';
              
              return (
                <View key={idx} className="flex-row items-center justify-between p-3 border border-[#27272a] rounded-xl bg-[#09090b] mb-3">
                  <View className="flex-row items-center gap-3">
                    <View className={`w-10 h-10 rounded-full border border-zinc-600 ${bgColor} items-center justify-center`}>
                      <Text className={`${textColor} font-bold`}>{uName.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-white text-sm font-bold">{uName}</Text>
                      <Text className="text-zinc-500 text-[10px] mt-0.5" numberOfLines={1} style={{maxWidth: 100}}>({uTitle})</Text>
                    </View>
                  </View>
                  <View className="items-end mr-3">
                    <Text className="text-zinc-400 text-[9px] mb-1">Ngày nghỉ: <Text className="text-emerald-400 font-bold bg-emerald-900/40 px-1 rounded">0/2 ngày</Text></Text>
                    <Text className="text-zinc-400 text-[9px] mb-1">Giờ chấm công: <Text className="text-white font-bold bg-[#38bdf8]/20 px-1 rounded">0h</Text></Text>
                    <Text className="text-zinc-400 text-[9px]">Đi muộn/Phạt: <Text className="text-zinc-400 font-bold">0 lần</Text></Text>
                  </View>
                  <View className="gap-1.5">
                    <TouchableOpacity className="w-6 h-6 bg-rose-500/10 border border-rose-500/20 rounded items-center justify-center">
                      <FontAwesome5 name="gavel" size={10} color="#fb7185" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-6 h-6 bg-[#18181b] border border-[#27272a] rounded items-center justify-center">
                      <FontAwesome5 name="chevron-down" size={10} color="#a1a1aa" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {hrUsers.length === 0 && !loading && (
              <Text className="text-zinc-500 text-center italic py-4">Chưa có dữ liệu nhân sự.</Text>
            )}

          </View>
          
          <View className="h-20" />
        </View>
      </ScrollView>

      {/* KPI Modal */}
      <KPIModalNative 
        visible={showKPIModal} 
        onClose={() => setShowKPIModal(false)}
        users={hrUsers}
      />
    </ScreenContainer>
  );
}
