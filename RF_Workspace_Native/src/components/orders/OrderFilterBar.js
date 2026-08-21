import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const CHANNELS = [
  { id: 'all', label: 'Tất Cả', icon: 'server' },
  { id: 'shopee', label: 'Shopee', icon: 'shopping-bag' },
  { id: 'export', label: 'Xuất Khẩu', icon: 'globe-asia' },
  { id: 'tiktok', label: 'TikTok', icon: 'video' },
  { id: 'retail', label: 'Bán Lẻ', icon: 'store' },
];

const STATUSES = [
  { id: 'wait_prod', label: 'Chờ Sản Xuất', count: 1, icon: 'tools' },
  { id: 'wait_tracking', label: 'Chờ Mã Vận Đơn', count: 0, icon: 'barcode' },
  { id: 'wait_acc', label: 'Chờ Phụ Kiện', count: 0, icon: 'puzzle-piece' },
  { id: 'packing', label: 'Đang Đóng Gói', count: 0, icon: 'box-open' },
];

export default function OrderFilterBar({ activeChannel, setActiveChannel, activeStatus, setActiveStatus }) {
  return (
    <View className="mb-2">
      {/* Channels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 px-4">
        {CHANNELS.map(ch => {
          const isActive = activeChannel === ch.id;
          return (
            <TouchableOpacity
              key={ch.id}
              onPress={() => setActiveChannel(ch.id)}
              className={`flex-row items-center px-4 py-2 rounded-full border mr-2 ${
                isActive ? 'bg-[#d4af37]/10 border-[#d4af37]/40' : 'bg-[#18181b] border-[#27272a]'
              }`}
            >
              <FontAwesome5 name={ch.icon} size={12} color={isActive ? '#d4af37' : '#71717a'} />
              <Text className={`ml-2 text-xs font-semibold tracking-wide ${isActive ? 'text-[#d4af37]' : 'text-zinc-400'}`}>
                {ch.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Statuses */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {STATUSES.map(st => {
          const isActive = activeStatus === st.id;
          return (
            <TouchableOpacity
              key={st.id}
              onPress={() => setActiveStatus(st.id)}
              className={`flex-row items-center px-4 py-2 rounded-full border mr-2 ${
                isActive ? 'border-[#d4af37]/50 bg-[#d4af37]/5' : 'bg-[#18181b] border-[#27272a]'
              }`}
            >
              <FontAwesome5 name={st.icon} size={12} color={isActive ? '#d4af37' : '#71717a'} />
              <Text className={`ml-2 text-xs font-semibold tracking-wide ${isActive ? 'text-[#d4af37]' : 'text-zinc-400'}`}>
                {st.label}
              </Text>
              <View className={`ml-2 px-2 py-0.5 rounded-full ${isActive ? 'bg-[#d4af37]' : 'bg-zinc-800'}`}>
                <Text className={`text-[10px] font-semibold ${isActive ? 'text-black' : 'text-zinc-400'}`}>
                  {st.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
