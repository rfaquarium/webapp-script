import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import ScreenContainer from '../components/common/ScreenContainer';
import { apiGetAppData } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const REPORT_CHANNELS = [
  'Shopee VN',
  'Shopee TH',
  'Shopee SG',
  'Shopee MA',
  'Shopee PH',
  'Shopee TW',
  'TikTok Shop',
  'Cộng Tác Viên',
  'Bán Lẻ',
  'Bán Sỉ',
  'Bảo Hành'
];

export default function AnalyticsScreen() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBoss, setIsBoss] = useState(false);

  const fetchAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const boss = await AsyncStorage.getItem('rf_boss');
      setIsBoss(boss === 'true');

      const res = await apiGetAppData();
      if (res && res.success && res.data) {
        setOrders(res.data.orders || []);
        setTransactions(res.data.Transactions || []);
        setProducts(res.data.Products || []);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatMoney = (val) => Math.round(Number(val || 0)).toLocaleString('vi-VN');

  // Tính toán P&L & Channel Stats
  const pnlSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalPlatformFee = 0;
    let totalCOGS = 0;
    let totalSold = 0;
    
    // Channel Stats
    let channelStats = {};

    orders.forEach((o) => {
      const st = String(o.status || '').toUpperCase().trim();
      const isCancelled = st.includes('HỦY') || st.includes('HUỶ') || st === 'CANCELLED';
      const isReturned = st.includes('HOÀN') && !st.includes('HOÀN THÀNH');

      if (!isCancelled && !isReturned) {
        totalSold++;
        const rev = Number(o.revenue || 0);
        totalRevenue += rev;

        const fee =
          Number(o.feeFixed || 0) +
          Number(o.feeService || 0) +
          Number(o.feePayment || 0) +
          Number(o.feeAffiliate || 0) +
          Number(o.tax || 0);
        totalPlatformFee += fee;

        totalCOGS += Number(o.cogs || 0);
        
        // Accumulate channel data
        const ch = o.channel || 'Khác';
        if (!channelStats[ch]) channelStats[ch] = { revenue: 0, count: 0 };
        channelStats[ch].revenue += rev;
        channelStats[ch].count += 1;
      }
    });

    let totalSalary = 0;
    let totalOps = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      const cat = String(t.category || '').toLowerCase();
      if (t.type === 'Chi') {
        if (cat.includes('lương')) totalSalary += amt;
        else totalOps += amt;
      }
    });

    const netProfit = totalRevenue - totalCOGS - totalPlatformFee - totalSalary - totalOps;
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    // Format channel stats for UI
    const channelList = Object.keys(channelStats).map(key => ({
      name: key,
      revenue: channelStats[key].revenue,
      count: channelStats[key].count,
      percent: totalRevenue > 0 ? ((channelStats[key].revenue / totalRevenue) * 100).toFixed(1) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Prepare Pie Chart Data
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#d946ef'];
    const pieChartData = channelList.slice(0, 6).map((item, index) => ({
      name: item.name,
      revenue: item.revenue,
      color: colors[index % colors.length],
      legendFontColor: '#a1a1aa',
      legendFontSize: 11
    }));
    
    // Group remaining into 'Khác'
    if (channelList.length > 6) {
      const otherRev = channelList.slice(6).reduce((acc, curr) => acc + curr.revenue, 0);
      pieChartData.push({
        name: 'Khác',
        revenue: otherRev,
        color: '#71717a',
        legendFontColor: '#a1a1aa',
        legendFontSize: 11
      });
    }

    return {
      totalSold,
      totalRevenue,
      totalPlatformFee,
      totalCOGS,
      totalSalary,
      totalOps,
      netProfit,
      margin,
      channelList,
      pieChartData
    };
  }, [orders, transactions]);

  if (!isBoss) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <FontAwesome5 name="lock" size={48} color="#f43f5e" className="mb-4" />
        <Text className="text-white text-xl font-semibold uppercase text-center mb-2">Khu Vực Tuyệt Mật</Text>
        <Text className="text-zinc-500 text-xs text-center leading-relaxed">
          Chỉ tài khoản mang đặc quyền TỐI CAO mới được phép truy cập trung tâm phân tích P&L doanh nghiệp.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-0">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 bg-[#09090b] border-b border-white/5">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-semibold text-xl tracking-wide">TRUNG TÂM P&L</Text>
          <TouchableOpacity
            onPress={() => fetchAnalyticsData(true)}
            className="w-9 h-9 rounded-xl bg-[#121214] border border-white/10 items-center justify-center"
          >
            <FontAwesome5 name="sync-alt" size={12} color="#d4af37" />
          </TouchableOpacity>
        </View>
        <Text className="text-zinc-500 text-[10px] font-semibold uppercase">
          Giám sát biên lợi nhuận ròng toàn hệ thống
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#d4af37" />
          <Text className="text-zinc-500 text-xs mt-3">Đang kết xuất P&L...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAnalyticsData(true)} tintColor="#d4af37" />}
        >
          {/* Hero Net Profit Card */}
          <View className="bg-[#121214] border border-[#d4af37]/40 rounded-3xl p-5 mb-4 shadow-xl">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                Lợi Nhuận Ròng Thực Tế
              </Text>
              <View className="bg-[#d4af37]/20 px-2 py-0.5 rounded border border-[#d4af37]/30">
                <Text className="text-[#d4af37] font-mono text-xs font-semibold">{pnlSummary.margin}% Margin</Text>
              </View>
            </View>
            <Text className={`text-3xl font-semibold font-mono ${pnlSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {formatMoney(pnlSummary.netProfit)} đ
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-1">
              Đã trừ COGS, Phí sàn, Quỹ lương và Chi phí vận hành
            </Text>
          </View>

          {/* 4 Chỉ số tài chính */}
          <View className="grid grid-cols-2 gap-2.5 mb-4">
            <View className="bg-[#121214] border border-white/10 p-3.5 rounded-2xl">
              <Text className="text-zinc-500 text-[10px] font-semibold uppercase">Tổng Doanh Thu</Text>
              <Text className="text-emerald-400 font-semibold text-sm font-mono mt-0.5">
                {formatMoney(pnlSummary.totalRevenue)} đ
              </Text>
            </View>

            <View className="bg-[#121214] border border-white/10 p-3.5 rounded-2xl">
              <Text className="text-zinc-500 text-[10px] font-semibold uppercase">Giá Vốn (COGS)</Text>
              <Text className="text-amber-400 font-semibold text-sm font-mono mt-0.5">
                {formatMoney(pnlSummary.totalCOGS)} đ
              </Text>
            </View>

            <View className="bg-[#121214] border border-white/10 p-3.5 rounded-2xl">
              <Text className="text-zinc-500 text-[10px] font-semibold uppercase">Chi Phí Sàn</Text>
              <Text className="text-rose-400 font-semibold text-sm font-mono mt-0.5">
                {formatMoney(pnlSummary.totalPlatformFee)} đ
              </Text>
            </View>

            <View className="bg-[#121214] border border-white/10 p-3.5 rounded-2xl">
              <Text className="text-zinc-500 text-[10px] font-semibold uppercase">Lương & Vận Hành</Text>
              <Text className="text-purple-400 font-semibold text-sm font-mono mt-0.5">
                {formatMoney(pnlSummary.totalSalary + pnlSummary.totalOps)} đ
              </Text>
            </View>
          </View>

          {/* Charts Section */}
          <View className="bg-[#121214] border border-white/10 rounded-3xl p-5 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-sm font-semibold uppercase tracking-widest">
                Doanh Thu Theo Kênh
              </Text>
              <FontAwesome5 name="chart-pie" size={14} color="#d4af37" />
            </View>
            
            {pnlSummary.pieChartData.length > 0 ? (
              <PieChart
                data={pnlSummary.pieChartData}
                width={screenWidth - 72}
                height={160}
                chartConfig={{
                  backgroundColor: '#121214',
                  backgroundGradientFrom: '#121214',
                  backgroundGradientTo: '#121214',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"revenue"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[10, 0]}
                hasLegend={true}
                absolute={false}
              />
            ) : (
              <View className="items-center py-4">
                <Text className="text-zinc-500 text-xs">Chưa có dữ liệu</Text>
              </View>
            )}
          </View>

          {/* Channel Table */}
          <View className="bg-[#121214] border border-white/10 rounded-3xl p-5">
            <View className="flex-row justify-between items-center mb-4 border-b border-white/5 pb-3">
              <Text className="text-white text-sm font-semibold uppercase tracking-widest">
                Hiệu Quả Các Kênh
              </Text>
              <FontAwesome5 name="list-ul" size={14} color="#d4af37" />
            </View>
            
            {pnlSummary.channelList.map((ch, idx) => (
              <View key={idx} className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-b-0">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 items-center justify-center">
                    <Text className="text-[#d4af37] text-xs font-bold">{idx + 1}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-xs font-semibold">{ch.name}</Text>
                    <Text className="text-zinc-500 text-[10px]">{ch.count} đơn hàng</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-400 text-xs font-semibold font-mono">
                    {formatMoney(ch.revenue)} đ
                  </Text>
                  <Text className="text-zinc-400 text-[10px] font-mono mt-0.5">
                    {ch.percent}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
