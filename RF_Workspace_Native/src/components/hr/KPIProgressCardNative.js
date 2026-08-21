import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function KPIProgressCardNative({
  user,
  userRole = 'Thợ',
  kpis = [],
  totalExp = 0,
  currentUser,
  isBoss,
  onClaimKPI,
  onEditKPI,
  onDeleteKPI
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('KPI'); // 'KPI' | 'TASKS' | 'XU'

  // Thuật toán cấp độ EXP chuẩn hóa Level 1 - 100
  const levelInfo = React.useMemo(() => {
    const exp = Math.max(0, Number(totalExp) || 0);
    const MAX_EXP = 2000000000; // 2 Tỷ EXP
    let level = Math.floor(Math.pow(exp / MAX_EXP, 1 / 2.25) * 99) + 1;
    level = Math.max(1, Math.min(100, level));

    const progressPct = Math.min(100, (exp % 1000000) / 10000);
    return { level, progressPct, exp };
  }, [totalExp]);

  const monthlyKPIs = kpis.filter(k => !String(k.unit || '').toLowerCase().includes('xu') && !String(k.id || '').startsWith('KPI_XU_'));
  const dailyTasks = kpis.filter(k => String(k.unit || '').toLowerCase().includes('xu') || String(k.id || '').startsWith('KPI_XU_'));

  const formatMoney = (val) => Math.ceil(Number(val || 0)).toLocaleString('vi-VN');

  return (
    <View className="bg-[#121214] border border-white/10 rounded-2xl p-4 mb-3">
      {/* Header Level & User Profile */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="w-11 h-11 rounded-full bg-[#1e222d] border border-amber-500/50 items-center justify-center">
            <Text className="text-amber-400 font-semibold text-sm">{user.charAt(0)}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-white font-semibold text-sm">{user}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
                <Text className="text-amber-400 font-semibold text-[9px]">CẤP {levelInfo.level}</Text>
              </View>
              <Text className="text-zinc-500 text-[10px] font-semibold">{userRole}</Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-[10px] text-emerald-400 font-semibold font-mono">
            {formatMoney(levelInfo.exp)} EXP
          </Text>
          <FontAwesome5 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={10} color="#71717a" className="mt-1" />
        </View>
      </TouchableOpacity>

      {/* Accordion Chi tiết KPI / Nhiệm vụ */}
      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-white/5 space-y-2">
          {/* Sub-tab switcher */}
          <View className="flex-row bg-[#09090b] p-1 rounded-xl border border-white/5">
            <TouchableOpacity
              onPress={() => setActiveTab('KPI')}
              className={`flex-1 py-1.5 rounded-lg items-center ${activeTab === 'KPI' ? 'bg-amber-500/20 border border-amber-500/40' : ''}`}
            >
              <Text className={`text-[10px] font-semibold ${activeTab === 'KPI' ? 'text-amber-400' : 'text-zinc-400'}`}>
                KPI Tháng ({monthlyKPIs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('TASKS')}
              className={`flex-1 py-1.5 rounded-lg items-center ${activeTab === 'TASKS' ? 'bg-blue-500/20 border border-blue-500/40' : ''}`}
            >
              <Text className={`text-[10px] font-semibold ${activeTab === 'TASKS' ? 'text-blue-400' : 'text-zinc-400'}`}>
                Nhiệm Vụ Xu ({dailyTasks.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* List items */}
          <View className="space-y-2 pt-1">
            {(activeTab === 'KPI' ? monthlyKPIs : dailyTasks).map((k) => {
              const current = Number(k.current || 0);
              const target = Number(k.target || 1);
              const isCompleted = current >= target;
              const isClaimed = k.isClaimed === true || String(k.isClaimed) === 'true';

              return (
                <View key={k.id} className="bg-[#09090b] p-3 rounded-xl border border-white/5">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-zinc-200 font-semibold text-xs flex-1 mr-2">{k.kpiName}</Text>
                    <Text className="text-amber-400 font-mono font-semibold text-xs">
                      {current}/{target} {k.unit}
                    </Text>
                  </View>

                  <Text className="text-zinc-500 text-[10px] italic mb-2">{k.guide || 'Thực hiện theo tiêu chuẩn xưởng'}</Text>

                  <View className="flex-row justify-between items-center pt-1 border-t border-white/5">
                    <Text className="text-emerald-400 font-semibold text-[10px]">
                      Thưởng: +{formatMoney(k.reward)} {String(k.unit).toLowerCase().includes('xu') ? 'XU' : 'đ'}
                    </Text>

                    {isCompleted ? (
                      isClaimed ? (
                        <Text className="text-zinc-500 text-[10px] font-semibold uppercase">✓ ĐÃ NHẬN</Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() => onClaimKPI && onClaimKPI(k)}
                          className="bg-amber-500 px-2.5 py-1 rounded-lg"
                        >
                          <Text className="text-black text-[9px] font-semibold uppercase">Nhận Thưởng</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <Text className="text-zinc-600 text-[9px] font-semibold uppercase">ĐANG TIẾN HÀNH</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
