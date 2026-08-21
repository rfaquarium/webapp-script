import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OrderCard({ order, index }) {
  // Graceful fallbacks
  const oCode = order?.orderCode || '260820U72TQN1S';
  const tracking = 'SPXVN060255367578';
  const customer = order?.customer || 'thiendat3012';
  const channelBg = 'bg-[#ea580c]'; // Shopee orange
  const channelText = 'SHOPEE VN';

  return (
    <View className="mb-4 bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-xl">
      {/* Top Row */}
      <View className="flex-row items-center justify-between p-3 border-b border-[#27272a]">
        <View className="flex-row items-center gap-2">
          <View className="w-5 h-5 rounded-full border border-zinc-600 items-center justify-center">
            <Text className="text-zinc-400 text-[9px] font-semibold">{index + 1 || 1}</Text>
          </View>
          <View className={`${channelBg} px-2 py-0.5 rounded-md`}>
            <Text className="text-white text-[9px] font-semibold tracking-widest">{channelText}</Text>
          </View>
          <Text className="text-zinc-500 text-[10px] font-semibold">21:28 20-08</Text>
        </View>
        <View className="flex-row gap-1">
          {['copy', 'info-circle', 'edit', 'history', 'ban', 'trash'].map((icon, i) => (
            <TouchableOpacity key={i} className="w-6 h-6 bg-[#18181b] border border-[#27272a] rounded-md items-center justify-center active:bg-zinc-800">
              <FontAwesome5 name={icon} size={9} color="#a1a1aa" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-[#d4af37] text-xl font-semibold mb-1">{oCode}</Text>
        <Text className="text-[#10b981] text-[11px] font-semibold tracking-widest mb-3">Mã Vận Đơn: {tracking}</Text>
        <View className="flex-row items-center gap-2 mb-4">
          <FontAwesome5 name="user" size={10} color="#71717a" />
          <Text className="text-zinc-400 text-xs font-semibold" numberOfLines={1}>{customer}</Text>
        </View>

        {/* Nested Production Item */}
        <View className="bg-[#121214] border border-[#27272a] rounded-xl p-3 flex-row items-center gap-3">
          <View className="w-10 h-10 bg-white rounded-lg items-center justify-center border border-zinc-300">
            <Text className="text-zinc-300 text-[8px] font-semibold text-center">BỂ{'\n'}KÍNH</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className="text-white text-xs font-semibold flex-1 tracking-wide" numberOfLines={1}>Bể 14x14x20cm</Text>
              <View className="bg-zinc-800 px-1.5 py-0.5 rounded ml-2 border border-zinc-700">
                <Text className="text-white text-[9px] font-semibold">x1 Cái</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5 mb-2">
              <FontAwesome5 name="info-circle" size={10} color="#a855f7" />
              <Text className="text-[#a855f7] text-[10px] italic flex-1 font-medium" numberOfLines={1}>
                Sản xuất mới cho đơn {oCode} | MVĐ: SPXVN...
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <FontAwesome5 name="clock" size={10} color="#d4af37" />
              <Text className="text-[#d4af37] text-[10px] font-semibold uppercase tracking-widest">Chờ Sản Xuất</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
