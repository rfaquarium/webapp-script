import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BomModal({ item, bomConfig, onClose }) {
  const bomItems = useMemo(() => {
    if (!item) return [];
    const varSku = String(item.sku || '').trim().toUpperCase();
    return bomConfig.filter(b => 
      (b.product_id && b.product_id === item.id) ||
      (b.layoutCode && String(b.layoutCode).trim().toUpperCase() === varSku)
    );
  }, [item, bomConfig]);

  if (!item) return null;

  return (
    <Modal transparent animationType="fade" visible={!!item} onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-end sm:justify-center p-4">
        <View className="bg-[#141414] border border-[#333] rounded-3xl p-5 shadow-2xl max-h-[80%]">
          
          <View className="flex-row justify-between items-center mb-4 border-b border-white/5 pb-3">
            <View>
              <Text className="font-black text-lg text-[#d4af37]">ĐỊNH MỨC VẬT TƯ</Text>
              <Text className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">{item.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <FontAwesome5 name="times" size={20} color="#71717a" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mb-4">
            {bomItems.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-zinc-500 font-semibold text-xs">Sản phẩm này chưa có định mức vật tư.</Text>
              </View>
            ) : (
              bomItems.map((b, idx) => (
                <View key={idx} className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-b-0">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 items-center justify-center">
                      <FontAwesome5 name="cube" size={12} color="#818cf8" />
                    </View>
                    <View>
                      <Text className="text-white text-xs font-bold">{b.materialSku}</Text>
                    </View>
                  </View>
                  <View className="items-end bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30">
                    <Text className="text-indigo-300 font-mono font-bold">{b.defaultQty} <Text className="text-[10px]">{b.unit}</Text></Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity 
            onPress={onClose}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 items-center justify-center active:bg-zinc-800"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
