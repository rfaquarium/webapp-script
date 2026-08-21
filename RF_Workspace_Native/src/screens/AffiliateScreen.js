import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../components/common/ScreenContainer';
import { apiGetAppData, apiSyncDeltas } from '../services/api';

export default function AffiliateScreen() {
  const [orders, setOrders] = useState([]);
  const [ctvFinance, setCtvFinance] = useState([]);
  const [userConfigs, setUserConfigs] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCTV, setSelectedCTV] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  // Form Thêm Phụ Phí
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState('PHÍ VẬN CHUYỂN');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const isCTV = userRole === 'CTV' || userRole === 'CỘNG TÁC VIÊN';
  const isAdmin = userRole === 'TỐI CAO' || userRole === 'KẾ TOÁN' || userRole === 'QUẢN LÝ BÁN HÀNG';

  const fetchAffiliateData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const user = await AsyncStorage.getItem('rf_user');
      const role = await AsyncStorage.getItem('rf_role');
      if (user) setCurrentUser(user);
      if (role) setUserRole(role);

      const res = await apiGetAppData();
      if (res && res.success && res.data) {
        setOrders(res.data.orders || []);
        setCtvFinance(res.data.ctvFinance || []);
        setUserConfigs(res.data.userConfigs || {});
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu CTV:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const ctvList = useMemo(() => {
    if (!userConfigs || !userConfigs.users || !userConfigs.roles) return [];
    return userConfigs.users.filter((name) => {
      const r = String(userConfigs.roles[name] || '').toUpperCase();
      return r === 'CTV' || r === 'CỘNG TÁC VIÊN';
    });
  }, [userConfigs]);

  useEffect(() => {
    if (isCTV) setSelectedCTV(currentUser);
    else if (ctvList.length > 0 && !selectedCTV) setSelectedCTV(ctvList[0]);
  }, [isCTV, currentUser, ctvList]);

  // Lọc danh sách đơn CTV
  const ctvOrders = useMemo(() => {
    if (!selectedCTV) return [];
    return orders.filter((o) => {
      const ch = String(o.channel || '').toUpperCase();
      const isCtvChannel = ch.includes('CỘNG TÁC VIÊN') || ch === 'CTV';
      const orderMonth = (o.date || o.createdAt || '').substring(0, 7);
      const matchMonth = !selectedMonth || orderMonth === selectedMonth;
      return (
        matchMonth &&
        isCtvChannel &&
        (o.updatedBy === selectedCTV ||
          o.createdBy === selectedCTV ||
          o.responsibleUser === selectedCTV ||
          o.customer === selectedCTV)
      );
    }).sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  }, [orders, selectedCTV, selectedMonth]);

  // Lọc giao dịch phụ phí CTV
  const ctvTxs = useMemo(() => {
    if (!selectedCTV) return [];
    return ctvFinance.filter((t) => {
      const txMonth = (t.date || '').substring(0, 7);
      const matchMonth = !selectedMonth || txMonth === selectedMonth;
      return t.user === selectedCTV && matchMonth;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [ctvFinance, selectedCTV, selectedMonth]);

  // Dư Nợ CTV
  const debtStats = useMemo(() => {
    let orderDebt = 0;
    let totalOrderRevenue = 0;
    let totalOrderCOD = 0;

    ctvOrders.forEach((o) => {
      if (o.status === 'Hàng Hoàn' || o.status === 'Đơn Huỷ') return;
      const rev = Number(o.revenue) || 0;
      const cod = Number(o.cod) || 0;
      orderDebt += rev - cod;
      totalOrderRevenue += rev;
      totalOrderCOD += cod;
    });

    let extraDebt = 0;
    let totalPaid = 0;
    ctvTxs.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'THANH TOÁN' || t.type === 'DƯ NỢ KỲ TRƯỚC (SHOP NỢ)') {
        if (t.type === 'THANH TOÁN') totalPaid += amt;
        extraDebt -= amt;
      } else {
        extraDebt += amt;
      }
    });

    const finalDebt = orderDebt + extraDebt;
    return { finalDebt, orderDebt, extraDebt, totalOrderRevenue, totalOrderCOD, totalPaid };
  }, [ctvOrders, ctvTxs]);

  const formatMoney = (n) => Math.round(Number(n || 0)).toLocaleString('vi-VN');

  const handleAddTransaction = async () => {
    if (!txAmount || Number(txAmount) === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const newTx = {
      id: 'CTX_' + Date.now(),
      date: new Date().toISOString().substring(0, 10),
      type: txType,
      amount: Number(txAmount),
      note: txNote.trim(),
      user: selectedCTV,
      status: 'Hoàn Thành'
    };

    setCtvFinance((prev) => [newTx, ...prev]);
    await apiSyncDeltas({ ctvTransactions: [newTx] });
    setShowAddTx(false);
    setTxAmount('');
    setTxNote('');
    Alert.alert('Thành công', 'Đã ghi nhận giao dịch đối soát!');
  };

  return (
    <ScreenContainer className="px-0">
      {/* Header Bar */}
      <View className="px-4 pt-2 pb-3 bg-[#09090b] border-b border-white/5">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-white font-semibold text-xl tracking-wide">ĐỐI SOÁT CTV</Text>
            <Text className="text-zinc-500 text-[10px] font-semibold uppercase mt-0.5">
              Quản lý công nợ & chiết khấu đối tác
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => fetchAffiliateData(true)}
            className="w-9 h-9 rounded-xl bg-[#121214] border border-white/10 items-center justify-center"
          >
            <FontAwesome5 name="sync-alt" size={12} color="#d4af37" />
          </TouchableOpacity>
        </View>

        {/* CTV Picker & Add Button */}
        <View className="flex-row gap-2">
          {isAdmin ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 flex-1">
              {ctvList.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCTV(c)}
                  className={`px-3 py-1.5 rounded-xl border ${
                    selectedCTV === c ? 'bg-[#d4af37] border-[#d4af37]' : 'bg-[#121214] border-white/10'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedCTV === c ? 'text-black font-semibold' : 'text-zinc-300'}`}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-[#121214] px-3 py-1.5 rounded-xl border border-white/10 flex-1">
              <Text className="text-zinc-300 font-semibold text-xs">CTV: {selectedCTV}</Text>
            </View>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={() => setShowAddTx(!showAddTx)}
              className="bg-[#d4af37] px-3 py-1.5 rounded-xl items-center justify-center"
            >
              <Text className="text-black font-semibold text-xs">+ Phụ Phí</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#d4af37" />
          <Text className="text-zinc-500 text-xs mt-3">Đang tải đối soát CTV...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAffiliateData(true)} tintColor="#d4af37" />}
        >
          {/* Bento Stats */}
          <View className="grid grid-cols-2 gap-2 mb-3">
            <View className="bg-[#121214] border border-white/10 p-3.5 rounded-2xl">
              <Text className="text-zinc-400 text-[10px] font-semibold uppercase">Dư Nợ Đơn Hàng</Text>
              <Text className="text-emerald-400 font-semibold text-base font-mono mt-0.5">
                {formatMoney(debtStats.orderDebt)} đ
              </Text>
              <Text className="text-zinc-600 text-[9px] mt-1">Doanh thu - Thu COD</Text>
            </View>

            <View className={`border p-3.5 rounded-2xl ${
              debtStats.finalDebt > 0 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-emerald-950/20 border-emerald-500/40'
            }`}>
              <Text className={`text-[10px] font-semibold uppercase ${
                debtStats.finalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {debtStats.finalDebt > 0 ? 'CTV Nợ Shop' : 'Shop Nợ CTV'}
              </Text>
              <Text className={`font-semibold text-base font-mono mt-0.5 ${
                debtStats.finalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {formatMoney(Math.abs(debtStats.finalDebt))} đ
              </Text>
            </View>
          </View>

          {/* Form thêm phụ phí nhanh */}
          {showAddTx && (
            <View className="bg-[#18181b] border border-[#d4af37]/40 rounded-2xl p-4 mb-4 space-y-3">
              <Text className="text-white font-semibold text-xs uppercase tracking-wider">Thêm Giao Dịch Phụ Phí</Text>
              
              <View className="flex-row gap-2">
                {['PHÍ VẬN CHUYỂN', 'HOÀN HÀNG', 'THANH TOÁN'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTxType(t)}
                    className={`flex-1 py-2 rounded-xl items-center border ${
                      txType === t ? 'bg-[#d4af37] border-[#d4af37]' : 'bg-[#121214] border-white/10'
                    }`}
                  >
                    <Text className={`text-[9px] font-semibold ${txType === t ? 'text-black font-semibold' : 'text-zinc-400'}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                value={txAmount}
                onChangeText={setTxAmount}
                placeholder="Số tiền (VNĐ)..."
                placeholderTextColor="#52525b"
                keyboardType="numeric"
                className="bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono font-semibold text-xs"
              />

              <TextInput
                value={txNote}
                onChangeText={setTxNote}
                placeholder="Ghi chú đơn hàng liên quan..."
                placeholderTextColor="#52525b"
                className="bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
              />

              <TouchableOpacity
                onPress={handleAddTransaction}
                className="bg-[#d4af37] py-2.5 rounded-xl items-center"
              >
                <Text className="text-black font-semibold text-xs uppercase">Lưu Giao Dịch</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Danh sách đơn hàng CTV */}
          <Text className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            Đơn Hàng Trong Kỳ ({ctvOrders.length})
          </Text>
          {ctvOrders.map((o) => (
            <View key={o.id} className="bg-[#121214] border border-white/10 rounded-2xl p-3.5 mb-2.5">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-white font-semibold text-xs">{o.customer || 'Khách'}</Text>
                <Text className="text-emerald-400 font-mono font-semibold text-xs">
                  {formatMoney(o.revenue)} đ
                </Text>
              </View>
              <View className="flex-row justify-between items-center text-zinc-500">
                <Text className="text-zinc-500 font-mono text-[10px]">{o.orderCode} • {o.status}</Text>
                <Text className="text-amber-400 font-mono text-[10px]">COD: {formatMoney(o.cod)} đ</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
