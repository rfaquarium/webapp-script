import React from 'react';
import { View, Text } from 'react-native';

const STATUS_THEMES = {
  'ĐÃ GIAO': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  'HOÀN THÀNH': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  'DONE': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  'SẴN SÀNG ĐÓNG GÓI': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  'ĐANG SẢN XUẤT': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  'CHỜ SẢN XUẤT': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  'ĐƠN HUỶ': 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  'HỦY/VỠ': 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  'HÀNG HOÀN': 'bg-purple-500/10 border-purple-500/30 text-purple-400'
};

export default function RFBadge({ status = '', className = '' }) {
  const normStatus = String(status).toUpperCase().trim();
  const themeStyle = STATUS_THEMES[normStatus] || 'bg-zinc-800 border-zinc-700 text-zinc-400';

  return (
    <View className={`self-start rounded-md border px-2 py-0.5 ${themeStyle} ${className}`}>
      <Text className="text-[10px] font-semibold uppercase tracking-wider">{status}</Text>
    </View>
  );
}
