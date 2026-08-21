import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import WorkerPhaseNative from './WorkerPhaseNative';

const CONFIGS_BE_KINH = [
  { k: 'phase1', n: 'Cắt Dán' },
  { k: 'phase2', n: 'Gọt Keo' }
];

const CONFIGS_KHUNG = [
  { k: 'phase1', n: 'Dựng Khung' },
  { k: 'phase2', n: 'Gia Cố' }
];

export default function WorkerCardNative({ item, order = {}, typeTab, userConfigs }) {
  const configs = typeTab === 'Bể Kính' ? CONFIGS_BE_KINH : CONFIGS_KHUNG;
  
  const orderCode = order.orderCode || item.orderId || 'SẢN XUẤT TỒN';
  const itemName = item.name || 'Sản phẩm không tên';
  const channel = order.channel || (item.orderId === 'SẢN XUẤT TỒN' ? 'SẢN XUẤT TỒN' : 'BÁN LẺ');
  
  // Try to determine main worker
  const p1User = item.phases?.phase1?.user || item.p1_user || '';
  const p2User = item.phases?.phase2?.user || item.p2_user || '';
  const mainWorker = p1User || p2User || 'Chưa phân công';

  return (
    <View className="bg-[#09090b] rounded-2xl border border-[#27272a] p-4 mb-4 shadow-xl">
      
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between mb-3 border-b border-[#27272a] pb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-4 h-4 bg-white rounded-sm border border-zinc-400" />
          <View className="flex-row items-center gap-2">
            <View className={`${channel === 'SẢN XUẤT TỒN' ? 'bg-purple-900/40 border-purple-700/50' : 'bg-orange-900/40 border-orange-700/50'} border rounded-full px-2.5 py-1 flex-row items-center gap-1.5`}>
              <FontAwesome5 name="layer-group" size={10} color={channel === 'SẢN XUẤT TỒN' ? '#c084fc' : '#fb923c'} />
              <Text className={`${channel === 'SẢN XUẤT TỒN' ? 'text-purple-300' : 'text-orange-300'} text-[9px] font-semibold tracking-widest uppercase`}>{channel}</Text>
            </View>
            <Text className="text-zinc-300 text-[11px] font-semibold">{orderCode}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          {['camera', 'edit', 'trash'].map((icon, i) => (
            <TouchableOpacity key={i} className="w-7 h-7 bg-[#18181b] border border-[#27272a] rounded-lg items-center justify-center active:bg-zinc-800">
              <FontAwesome5 name={icon} size={10} color="#a1a1aa" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Row */}
      <View className="flex-row items-center mb-4">
        <View className="bg-sky-900/30 border border-sky-700/50 rounded-full px-2.5 py-1 flex-row items-center gap-1.5">
          <FontAwesome5 name="user-alt" size={9} color="#38bdf8" />
          <Text className="text-sky-300 text-[9px] font-semibold tracking-widest uppercase">Thợ: {mainWorker}</Text>
        </View>
      </View>

      {/* Product Content */}
      <View className="flex-row gap-4 mb-5 items-center">
        <View className="w-16 h-16 bg-white rounded-xl items-center justify-center border border-zinc-300 overflow-hidden">
           {/* Fallback avatar/image if real image is not present */}
          <FontAwesome5 name="box" size={24} color="#a1a1aa" />
        </View>
        <View className="flex-1 justify-center">
          {channel === 'SẢN XUẤT TỒN' && (
            <View className="bg-rose-900/50 border border-rose-700/50 rounded flex-row items-center px-1.5 py-0.5 self-start mb-1.5">
              <Text className="text-rose-400 text-[9px] font-semibold uppercase tracking-widest">Tồn đọng</Text>
            </View>
          )}
          <Text className="text-[#d4af37] text-base font-semibold tracking-tight" numberOfLines={2}>
            {itemName}
          </Text>
        </View>
      </View>

      {/* Thin line divider */}
      <View className="h-[1px] w-full bg-[#27272a] mb-4" />

      {/* Phases */}
      <View className="space-y-1">
        {configs.map((c) => (
          <WorkerPhaseNative 
            key={c.k} 
            phaseKey={c.k} 
            phaseConfig={c} 
            item={item} 
            userConfigs={userConfigs}
            currentUser={currentUser}
            isAdmin={isAdmin}
            updateDeltas={updateDeltas}
          />
        ))}

        {/* Khâu KCS (QC Phase) */}
        {item.qc_status !== 'Passed' && (
          <View className="flex-row items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-900/10 mt-2">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/50 items-center justify-center">
                <FontAwesome5 name="clipboard-check" size={12} color="#f43f5e" />
              </View>
              <View>
                <Text className="text-white text-[13px] font-semibold">Khâu KCS</Text>
                <Text className="text-rose-400 text-[10px] font-semibold">Chờ Quản lý duyệt</Text>
              </View>
            </View>
            {isAdmin && (
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => updateDeltas && updateDeltas({ updates: { prodItems: [{ id: item.id, qc_status: 'Rejected' }] } })}
                  className="px-3 py-1.5 border border-rose-500/50 bg-rose-900/40 rounded-lg active:bg-rose-800"
                >
                  <Text className="text-rose-400 text-[11px] font-bold">Lỗi</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateDeltas && updateDeltas({ updates: { prodItems: [{ id: item.id, qc_status: 'Passed' }] } })}
                  className="px-3 py-1.5 border border-emerald-500/50 bg-emerald-900/40 rounded-lg active:bg-emerald-800"
                >
                  <Text className="text-emerald-400 text-[11px] font-bold">Đạt</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {item.qc_status === 'Passed' && (
          <View className="flex-row items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-900/10 mt-2">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 items-center justify-center">
                <FontAwesome5 name="check-double" size={12} color="#10b981" />
              </View>
              <View>
                <Text className="text-emerald-400 text-[13px] font-semibold">Đã duyệt KCS</Text>
              </View>
            </View>
          </View>
        )}

      </View>

    </View>
  );
}
