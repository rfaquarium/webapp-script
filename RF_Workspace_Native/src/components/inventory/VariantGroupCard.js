import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatMoney = (val) => Math.round(Number(val || 0)).toLocaleString('vi-VN');

export default function VariantGroupCard({ group, bomConfig, currentUserRole, isBoss, onShowBom }) {
  const [selectedVarId, setSelectedVarId] = useState(group.items[0]?.id);
  const [expanded, setExpanded] = useState(false);

  const selectedVar = useMemo(() => {
    return group.items.find(i => i.id === selectedVarId) || group.items[0];
  }, [group, selectedVarId]);

  const bomItems = useMemo(() => {
    if (!selectedVar) return [];
    const varSku = String(selectedVar.sku || '').trim().toUpperCase();
    return bomConfig.filter(b => 
      (b.product_id && b.product_id === selectedVar.id) ||
      (b.layoutCode && String(b.layoutCode).trim().toUpperCase() === varSku)
    );
  }, [selectedVar, bomConfig]);

  const canViewCost = ['QUẢN LÝ KHO VẬN', 'TỐI CAO', 'KẾ TOÁN'].includes(String(currentUserRole || '').toUpperCase()) || isBoss;
  const isCTV = currentUserRole === 'CTV';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([^/]+)/);
      return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
    }
    if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([^&]+)/);
      return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
    }
    return url;
  };

  const currentImg = getImageUrl(selectedVar.image || selectedVar.realImage || group.image);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={toggleExpand}
      className={`bg-[#09090b]/80 border ${expanded ? 'border-[#d4af37]/40' : 'border-white/5'} rounded-2xl p-3 mb-3 shadow-lg overflow-hidden`}
    >
      <View className="flex-row items-center">
        {/* Thumbnail */}
        <View className={`bg-[#121214] border border-white/10 rounded-xl overflow-hidden justify-center items-center ${expanded ? 'w-20 h-20' : 'w-14 h-14'}`}>
          {currentImg ? (
            <Image source={{ uri: currentImg }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <FontAwesome5 name="box-open" size={expanded ? 24 : 16} color="#52525b" />
          )}
          
          {/* Status Ribbon */}
          {!isCTV && Number(selectedVar.quantity || 0) <= 0 ? (
            <View className="absolute bottom-0 w-full bg-rose-600/90 py-0.5 border-t border-rose-500 items-center justify-center">
              <Text className="text-white text-[7px] font-black uppercase tracking-widest">Hết hàng</Text>
            </View>
          ) : !isCTV && Number(selectedVar.minStock || 0) > 0 && Number(selectedVar.quantity || 0) <= Number(selectedVar.minStock || 0) ? (
            <View className="absolute bottom-0 w-full bg-amber-500/90 py-0.5 border-t border-amber-400 items-center justify-center">
              <Text className="text-black text-[7px] font-black uppercase tracking-widest">Cần nhập</Text>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View className="flex-1 px-3">
          <Text className={`text-white font-semibold ${expanded ? 'text-sm mb-1' : 'text-xs'}`} numberOfLines={expanded ? 2 : 1}>
            {group.baseName}
          </Text>
          <View className="flex-row items-center mt-1 flex-wrap gap-1">
            <View className="bg-[#d4af37]/10 px-1.5 py-0.5 rounded border border-[#d4af37]/30">
              <Text className="text-[#d4af37] text-[9px] font-bold uppercase tracking-widest">{selectedVar.sku || 'NO-SKU'}</Text>
            </View>
            {!expanded && (
              <Text className="text-[#10b981] text-[10px] font-semibold ml-1">
                {formatMoney(selectedVar.price)}đ
              </Text>
            )}
          </View>
        </View>

        <View className="px-2">
          <FontAwesome5 name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color="#52525b" />
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View className="mt-3 pt-3 border-t border-white/10">
          
          {/* Variants Selector */}
          {group.items.length > 1 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {group.items.map(item => {
                const isSel = selectedVarId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedVarId(item.id)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      isSel ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${isSel ? 'text-white' : 'text-zinc-400'}`}>
                      {item.variantLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Pricing & Stock */}
          <View className="flex-row items-end justify-between border-t border-white/5 pt-3 mt-1">
            <View className="flex-row gap-4">
              {!isCTV && canViewCost && (
                <View>
                  <Text className="text-[9px] text-zinc-500 font-semibold uppercase mb-0.5 tracking-widest">Giá vốn</Text>
                  <Text className="text-xs text-zinc-400 font-bold">{formatMoney(selectedVar.costPrice)}đ</Text>
                </View>
              )}
              <View>
                <Text className="text-[9px] text-zinc-500 font-semibold uppercase mb-0.5 tracking-widest">Giá bán</Text>
                <Text className="text-sm text-[#10b981] font-bold">{formatMoney(selectedVar.price)}đ</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              {/* Stock display */}
              {!isCTV && (
                <View className="flex-row items-center bg-black/40 rounded-xl border border-white/10 p-1.5">
                  <View className="px-2 items-center justify-center border-r border-white/10">
                    <Text className="text-[7px] text-zinc-500 font-bold uppercase">Min</Text>
                    <Text className="text-[9px] text-zinc-400 font-bold mt-0.5">{selectedVar.minStock || 0}</Text>
                  </View>
                  <View className="px-3 items-center justify-center border-r border-white/10">
                    <Text className="text-[8px] text-[#d4af37] font-bold uppercase tracking-widest mb-0.5">Tồn kho</Text>
                    <Text className={`text-sm font-bold ${Number(selectedVar.quantity || 0) <= 0 ? 'text-rose-500' : 'text-[#d4af37]'}`}>
                      {selectedVar.quantity || 0}
                    </Text>
                  </View>
                  <View className="px-2 items-center justify-center">
                    <Text className="text-[7px] text-zinc-500 font-bold uppercase">Max</Text>
                    <Text className="text-[9px] text-zinc-400 font-bold mt-0.5">{selectedVar.maxStock || 0}</Text>
                  </View>
                </View>
              )}

              {/* BOM Button */}
              {bomItems.length > 0 && (
                <TouchableOpacity 
                  onPress={() => onShowBom && onShowBom(selectedVar)}
                  className="w-10 h-10 rounded-xl border border-indigo-500/40 bg-indigo-500/20 items-center justify-center"
                >
                  <FontAwesome5 name="layer-group" size={14} color="#818cf8" />
                  <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 items-center justify-center border border-[#09090b]">
                    <Text className="text-white text-[8px] font-bold">{bomItems.length}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
