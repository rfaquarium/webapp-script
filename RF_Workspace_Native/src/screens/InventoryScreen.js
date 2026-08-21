import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../components/common/ScreenContainer';
import { apiGetAppData } from '../services/api';
import VariantGroupCard from '../components/inventory/VariantGroupCard';
import BomModal from '../components/inventory/BomModal';

const CATEGORIES = ['Tất cả', 'Bể Kính', 'Layout', 'Phụ kiện', 'Vật tư', 'Đá', 'Lũa', 'Cây', 'Khác'];

export default function InventoryScreen() {
  const [products, setProducts] = useState([]);
  const [bomConfig, setBomConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [isBoss, setIsBoss] = useState(false);
  
  const [selectedBomItem, setSelectedBomItem] = useState(null);

  const fetchInventoryData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const role = await AsyncStorage.getItem('rf_role') || '';
      const boss = await AsyncStorage.getItem('rf_boss') === 'true';
      setCurrentUserRole(role);
      setIsBoss(boss);

      const res = await apiGetAppData();
      if (res && res.success && res.data) {
        setProducts(res.data.Products || []);
        setBomConfig(res.data.BOM_Config || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const groupedProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== 'Tất cả') {
      filtered = filtered.filter(p => String(p.category || '').toUpperCase() === activeCategory.toUpperCase());
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        String(p.name || '').toLowerCase().includes(q) || 
        String(p.sku || '').toLowerCase().includes(q)
      );
    }

    const groups = {};
    filtered.forEach(p => {
      let baseName = p.name || 'Không tên';
      if (baseName.includes(' - ')) {
        baseName = baseName.split(' - ')[0];
      }
      
      const parts = (p.name || '').split(' - ');
      let variantLabel = parts.length > 1 ? parts.slice(1).join(' - ') : 'MẶC ĐỊNH';
      
      if (!groups[baseName]) {
        groups[baseName] = {
          baseName,
          category: p.category,
          image: p.image,
          items: []
        };
      }
      groups[baseName].items.push({ ...p, variantLabel });
    });

    return Object.values(groups).sort((a, b) => a.baseName.localeCompare(b.baseName));
  }, [products, searchQuery, activeCategory]);

  return (
    <ScreenContainer className="px-0">
      <View className="px-4 pt-2 pb-3 bg-[#09090b] border-b border-white/5">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-semibold text-xl tracking-wide">KHO HÀNG</Text>
          <TouchableOpacity
            onPress={() => fetchInventoryData(true)}
            className="w-9 h-9 rounded-xl bg-[#121214] border border-white/10 items-center justify-center"
          >
            <FontAwesome5 name="sync-alt" size={12} color="#d4af37" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-[#121214] border border-white/10 rounded-xl px-3 py-2">
          <FontAwesome5 name="search" size={14} color="#52525b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo Tên hoặc SKU..."
            placeholderTextColor="#52525b"
            className="flex-1 ml-3 text-white text-xs font-semibold h-8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome5 name="times-circle" size={14} color="#52525b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="border-b border-white/5 bg-[#09090b]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`mr-2 px-4 py-1.5 rounded-full border ${activeCategory === cat ? 'bg-[#d4af37]/20 border-[#d4af37]/50' : 'bg-[#18181b] border-white/10'}`}
            >
              <Text className={`text-xs font-semibold ${activeCategory === cat ? 'text-[#d4af37]' : 'text-zinc-500'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#d4af37" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchInventoryData(true)} tintColor="#d4af37" />}
        >
          {groupedProducts.length === 0 ? (
            <View className="items-center justify-center py-10 opacity-50">
              <FontAwesome5 name="box-open" size={40} color="#71717a" />
              <Text className="text-zinc-400 font-semibold mt-4">Không tìm thấy sản phẩm nào</Text>
            </View>
          ) : (
            groupedProducts.map((group, index) => (
              <VariantGroupCard 
                key={index} 
                group={group} 
                bomConfig={bomConfig}
                currentUserRole={currentUserRole}
                isBoss={isBoss}
                onShowBom={(item) => setSelectedBomItem(item)}
              />
            ))
          )}
        </ScrollView>
      )}

      {selectedBomItem && (
        <BomModal 
          item={selectedBomItem} 
          bomConfig={bomConfig} 
          onClose={() => setSelectedBomItem(null)} 
        />
      )}
    </ScreenContainer>
  );
}
