import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function ProductionStatsModal({ visible, onClose, stats = [], filterTime, customMonth, currentUser }) {
  if (!visible) return null;

  const totalDungKhung = stats.reduce((sum, x) => sum + (x.dungKhung || 0), 0);
  const totalGiaCo = stats.reduce((sum, x) => sum + (x.giaCo || 0), 0);
  const totalCatDan = stats.reduce((sum, x) => sum + (x.catDan || 0), 0);
  const totalGotKeo = stats.reduce((sum, x) => sum + (x.gotKeo || 0), 0);
  const totalRework = stats.reduce((sum, x) => sum + (x.reworkCount || 0), 0);
  const totalOverdue = stats.reduce((sum, x) => sum + (x.overdueCount || 0), 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-white/10 bg-[#18181b]">
            <View>
              <Text className="text-white font-semibold text-sm uppercase tracking-wider">
                BÁO CÁO SẢN LƯỢNG THỢ
              </Text>
              <Text className="text-zinc-400 text-[10px] mt-0.5 font-semibold">
                Kỳ: {filterTime === 'Chọn Tháng' ? (customMonth || 'Tháng Đã Chọn') : filterTime}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
              <FontAwesome5 name="times" size={14} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Table content */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ScrollView className="max-h-[60vh]">
              <View className="min-w-[580px]">
                {/* Table Header */}
                <View className="flex-row bg-[#18181b] border-b border-white/10 py-2.5 px-3">
                  <Text className="w-32 text-zinc-300 font-semibold text-[10px] uppercase">Nhân Sự</Text>
                  <Text className="w-16 text-center text-[#f59e0b] font-semibold text-[10px] uppercase">D.Khung</Text>
                  <Text className="w-16 text-center text-[#10b981] font-semibold text-[10px] uppercase">Gia Cố</Text>
                  <Text className="w-16 text-center text-[#3b82f6] font-semibold text-[10px] uppercase">Cắt Dán</Text>
                  <Text className="w-16 text-center text-[#a855f7] font-semibold text-[10px] uppercase">Gọt Keo</Text>
                  <Text className="w-16 text-center text-rose-400 font-semibold text-[10px] uppercase">Làm Lại</Text>
                  <Text className="w-16 text-center text-amber-400 font-semibold text-[10px] uppercase">Quá Hạn</Text>
                </View>

                {/* Table Body */}
                {stats.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className="text-zinc-500 text-xs italic">Chưa có dữ liệu sản lượng trong kỳ</Text>
                  </View>
                ) : (
                  stats.map((w, idx) => {
                    const isMe = String(w.name).trim() === String(currentUser).trim();
                    return (
                      <View
                        key={idx}
                        className={`flex-row items-center border-b border-white/5 py-2.5 px-3 ${
                          isMe ? 'bg-[#d4af37]/10' : ''
                        }`}
                      >
                        <View className="w-32 flex-row items-center gap-1.5">
                          {isMe && <View className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                          <Text className={`text-xs font-semibold ${isMe ? 'text-[#d4af37]' : 'text-zinc-200'}`} numberOfLines={1}>
                            {w.name}
                          </Text>
                        </View>
                        <Text className="w-16 text-center text-[#f59e0b] font-mono text-xs font-semibold">{w.dungKhung || 0}</Text>
                        <Text className="w-16 text-center text-[#10b981] font-mono text-xs font-semibold">{w.giaCo || 0}</Text>
                        <Text className="w-16 text-center text-[#3b82f6] font-mono text-xs font-semibold">{w.catDan || 0}</Text>
                        <Text className="w-16 text-center text-[#a855f7] font-mono text-xs font-semibold">{w.gotKeo || 0}</Text>
                        <Text className="w-16 text-center text-rose-400 font-mono text-xs font-semibold">{w.reworkCount || 0}</Text>
                        <Text className="w-16 text-center text-amber-400 font-mono text-xs font-semibold">{w.overdueCount || 0}</Text>
                      </View>
                    );
                  })
                )}

                {/* Table Footer */}
                {stats.length > 0 && (
                  <View className="flex-row bg-[#18181b] border-t-2 border-white/10 py-3 px-3">
                    <Text className="w-32 text-[#d4af37] font-semibold text-xs uppercase">TỔNG CỘNG</Text>
                    <Text className="w-16 text-center text-[#f59e0b] font-mono text-xs font-semibold">{totalDungKhung}</Text>
                    <Text className="w-16 text-center text-[#10b981] font-mono text-xs font-semibold">{totalGiaCo}</Text>
                    <Text className="w-16 text-center text-[#3b82f6] font-mono text-xs font-semibold">{totalCatDan}</Text>
                    <Text className="w-16 text-center text-[#a855f7] font-mono text-xs font-semibold">{totalGotKeo}</Text>
                    <Text className="w-16 text-center text-rose-400 font-mono text-xs font-semibold">{totalRework}</Text>
                    <Text className="w-16 text-center text-amber-400 font-mono text-xs font-semibold">{totalOverdue}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Footer Close */}
          <View className="p-3 border-t border-white/10 bg-[#121214]">
            <TouchableOpacity onPress={onClose} className="bg-zinc-800 py-2.5 rounded-xl items-center">
              <Text className="text-zinc-300 font-semibold text-xs">ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
