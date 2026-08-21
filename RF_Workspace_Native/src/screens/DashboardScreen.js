import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../components/common/ScreenContainer';
import { apiGetAppData, apiSyncDeltas } from '../services/api';

// Đồng hồ Realtime chuẩn xác
function RealtimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const day = days[now.getDay()];
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <View className="flex-row items-center gap-1.5 mt-1">
      <FontAwesome5 name="clock" size={10} color="#34d399" />
      <Text className="text-[#34d399] font-mono text-[11px] font-semibold">
        {time} – {day}, {dateStr}
      </Text>
    </View>
  );
}

export default function DashboardScreen({ onNavigateTab, userAvatarUrl }) {
  const [currentUser, setCurrentUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isBoss, setIsBoss] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [attendance, setAttendance] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [tempNotice, setTempNotice] = useState('');

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const u = await AsyncStorage.getItem('rf_user');
      const r = await AsyncStorage.getItem('rf_role');
      const b = await AsyncStorage.getItem('rf_boss') === 'true';
      const p = await AsyncStorage.getItem('rf_pin');

      setCurrentUser(u || '');
      setUserRole(r || '');
      setIsBoss(b);

      const res = await apiGetAppData(p);
      if (res && res.success && res.data) {
        setAttendance(res.data.Attendance || []);
        setAnnouncement(res.data.Announcement || '');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const attendingStaff = useMemo(() => {
    const list = [];
    (attendance || []).forEach((a) => {
      if (String(a.date).includes(todayStr) && (a.timeIn || a.morningIn)) {
        list.push({
          name: a.user,
          time: a.timeIn || a.morningIn
        });
      }
    });
    return list;
  }, [attendance, todayStr]);

  const handleSaveNotice = async () => {
    try {
      const p = await AsyncStorage.getItem('rf_pin');
      const res = await apiSyncDeltas({ notice: tempNotice }, p);
      if (res && res.success) {
        setAnnouncement(tempNotice);
        setIsEditingNotice(false);
        Alert.alert('Thành công', 'Đã cập nhật thông báo!');
      } else {
        throw new Error(res?.message || 'Lỗi lưu thông báo');
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  // 6 Phím chức năng dạng lưới 2x3 chuẩn Bento Box
  const QUICK_ACTIONS = [
    { label: 'LÊN ĐƠN', icon: 'cart-plus', tab: 'orders', color: '#10b981', bg: 'bg-[#10b981]/10', border: 'border-[#10b981]/20' },
    { label: 'BẢNG GIÁ', icon: 'tags', tab: 'warehouse', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'PHIẾU KHO', icon: 'exchange-alt', tab: 'warehouse', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'TÍNH CƯỚC', icon: 'truck-moving', tab: 'orders', color: '#a855f7', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'THU CHI QUỸ', icon: 'file-invoice-dollar', tab: 'cashflow', color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'GIÁ LAYOUT', icon: 'drafting-compass', tab: 'production', color: '#ec4899', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ];

  return (
    <ScreenContainer className="px-0">
      {/* 1. Header Top Bar */}
      <View className="px-4 pt-3 pb-3 bg-[#09090b] border-b border-[#27272a]/60 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-9 h-9 rounded-xl bg-[#121214] border border-[#27272a] items-center justify-center"
          >
            <FontAwesome5 name="bars" size={14} color="#a1a1aa" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-tight">HỆ THỐNG NỘI BỘ</Text>
            <Text className="text-white font-semibold text-sm tracking-wide">Workspace Pro</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-9 h-9 rounded-xl bg-[#121214] border border-[#27272a] items-center justify-center"
          >
            <FontAwesome5 name="bell-slash" size={13} color="#71717a" />
          </TouchableOpacity>
          <View className="w-9 h-9 rounded-full bg-[#18181b] border-2 border-emerald-500/80 items-center justify-center overflow-hidden">
            {userAvatarUrl ? (
              <Image source={{ uri: userAvatarUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-[#d4af37] font-semibold text-xs">{currentUser ? currentUser.charAt(0) : 'U'}</Text>
            )}
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#d4af37" />
          <Text className="text-zinc-500 text-xs mt-3 font-semibold">Đang kết nối trung tâm điều hành...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboardData(true)} tintColor="#d4af37" />}
        >
          {/* 2. Tiêu Đề Tổng Quan & Đồng Hồ Realtime */}
          <View className="mb-4">
            <Text className="text-white font-semibold text-2xl tracking-tight">Tổng Quan</Text>
            <RealtimeClock />
          </View>

          {/* 3. Card Thông Tin Đăng Nhập */}
          <View className="bg-[#121214] border border-[#27272a] rounded-2xl p-3.5 mb-4 flex-row items-center gap-3.5 shadow-sm">
            <View className="w-11 h-11 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 items-center justify-center">
              <FontAwesome5 name="user-shield" size={16} color="#d4af37" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest">ĐĂNG NHẬP TÀI KHOẢN</Text>
              <Text className="text-[#d4af37] font-semibold text-sm mt-0.5" numberOfLines={1}>
                {currentUser || 'Khách'}{' '}
                <Text className="text-zinc-400 font-semibold text-xs">({isBoss ? 'TỐI CAO' : userRole || 'Nhân sự'})</Text>
              </Text>
            </View>
          </View>

          {/* 4. Card Loa Phát Thanh Nội Bộ */}
          <View className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <FontAwesome5 name="bullhorn" size={11} color="#d4af37" />
                <Text className="text-[#d4af37] font-semibold text-[11px] uppercase tracking-wider">
                  LOA PHÁT THANH NỘI BỘ
                </Text>
              </View>

              {isBoss && !isEditingNotice && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => { setTempNotice(announcement); setIsEditingNotice(true); }}
                  className="px-2.5 py-1 rounded-lg bg-transparent border border-[#d4af37]/30 flex-row items-center gap-1"
                >
                  <FontAwesome5 name="edit" size={9} color="#d4af37" />
                  <Text className="text-[#d4af37] text-[10px] font-semibold uppercase">PHÁT LOA MỚI</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditingNotice ? (
              <View className="space-y-3">
                <TextInput
                  value={tempNotice}
                  onChangeText={setTempNotice}
                  multiline
                  className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-zinc-100 text-xs font-medium min-h-[90px]"
                  placeholder="Nhập thông báo truyền đi toàn xưởng..."
                  placeholderTextColor="#52525b"
                />
                <View className="flex-row justify-end gap-2">
                  <TouchableOpacity onPress={() => setIsEditingNotice(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800">
                    <Text className="text-zinc-300 font-semibold text-xs">Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveNotice} className="px-4 py-1.5 rounded-lg bg-[#d4af37]">
                    <Text className="text-black font-semibold text-xs uppercase">Phát Loa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text className="text-zinc-300 text-xs leading-relaxed font-medium">
                {announcement}
              </Text>
            )}
          </View>

          {/* 5. Section Bảng Điều Khiển Nhanh */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3 px-0.5">
              <FontAwesome5 name="layer-group" size={12} color="#3b82f6" />
              <Text className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                BẢNG ĐIỀU KHIỂN NHANH
              </Text>
            </View>

            {/* Lưới 2 Cột chuẩn Bento Box */}
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {QUICK_ACTIONS.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => onNavigateTab && onNavigateTab(action.tab)}
                  style={{ width: '48.5%' }}
                  className="bg-[#121214] border border-[#27272a] hover:border-white/20 p-4 rounded-2xl items-center justify-center shadow-sm"
                >
                  <View className={`w-11 h-11 rounded-xl ${action.bg} ${action.border} border items-center justify-center mb-2.5`}>
                    <FontAwesome5 name={action.icon} size={16} color={action.color} />
                  </View>
                  <Text className="text-zinc-300 font-semibold text-[11px] tracking-wider uppercase">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 6. Section Đội Ngũ Hôm Nay */}
          <View className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 mb-2 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <FontAwesome5 name="users" size={12} color="#3b82f6" />
                <Text className="text-white font-semibold text-xs uppercase tracking-wider">
                  ĐỘI NGŨ HÔM NAY ({attendingStaff.length})
                </Text>
              </View>
              <Text className="text-zinc-500 text-[10px] font-semibold">Chấm công trực tuyến</Text>
            </View>

            {attendingStaff.length === 0 ? (
              <View className="py-4 items-center bg-[#09090b] rounded-xl border border-dashed border-[#27272a]">
                <Text className="text-zinc-500 text-xs italic font-medium">Chưa có ai check-in hôm nay</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {attendingStaff.map((st, idx) => (
                  <View
                    key={idx}
                    className="bg-[#09090b] border border-[#27272a] px-3 py-2 rounded-xl flex-row items-center gap-2"
                  >
                    <View className="w-6 h-6 rounded-full bg-blue-500/20 items-center justify-center">
                      <Text className="text-blue-400 font-semibold text-[10px]">{st.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-zinc-200 font-semibold text-xs">{st.name}</Text>
                      <Text className="text-emerald-400 font-mono text-[9px]">Vào: {st.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
