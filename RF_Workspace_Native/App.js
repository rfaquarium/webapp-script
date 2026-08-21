import './global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductionScreen from './src/screens/ProductionScreen';
import HRScreen from './src/screens/HRScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import AffiliateScreen from './src/screens/AffiliateScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBoss, setIsBoss] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const p = await AsyncStorage.getItem('rf_pin');
        const u = await AsyncStorage.getItem('rf_user');
        const r = await AsyncStorage.getItem('rf_role');
        const adm = await AsyncStorage.getItem('rf_admin');
        const b = await AsyncStorage.getItem('rf_boss');

        if (p && u) {
          setCurrentUser(u);
          setUserRole(r || '');
          setIsAdmin(adm === 'true');
          setIsBoss(b === 'true');
          if (r === 'CỘNG TÁC VIÊN' || r === 'CTV') setActiveTab('orders');

          // Fetch avatar
          import('./src/services/api').then(({ apiGetAppData }) => {
            apiGetAppData(p).then(res => {
              if (res && res.success && res.data && res.data.userConfigs && res.data.userConfigs.avatars) {
                let av = res.data.userConfigs.avatars[u];
                if (av) {
                  const str = String(av).trim();
                  if (str.includes('drive.google.com/file/d/')) {
                      const match = str.match(/\/d\/([^/]+)/);
                      av = match ? ('https://drive.google.com/uc?export=view&id=' + match[1]) : str;
                  } else if (str.includes('drive.google.com/open?id=')) {
                      const match = str.match(/id=([^&]+)/);
                      av = match ? ('https://drive.google.com/uc?export=view&id=' + match[1]) : str;
                  }
                  setUserAvatarUrl(av);
                }
              }
            }).catch(() => {});
          });
        }
      } catch (e) {
        console.error('Lỗi đọc session:', e);
      } finally {
        setIsReady(true);
      }
    };
    loadSession();
  }, []);

  const handleLogin = (user, admin, boss, role) => {
    setCurrentUser(user);
    setIsAdmin(admin);
    setIsBoss(boss);
    setUserRole(role);
    setActiveTab(role === 'CỘNG TÁC VIÊN' || role === 'CTV' ? 'orders' : 'dashboard');
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setCurrentUser(null);
    setIsAdmin(false);
    setIsBoss(false);
    setUserRole('');
    setIsMenuOpen(false);
  };

  if (!isReady) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-[#d4af37] font-bold mt-4">Đang khởi động hệ thống...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Tổng Quan', icon: 'home' },
    { id: 'orders', label: 'Đơn Hàng', icon: 'shopping-cart' },
    { id: 'production', label: 'Sản Xuất', icon: 'hammer' },
  ];

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-[#09090b]">
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />

        {/* Main View Router */}
        <View className="flex-1 bg-[#09090b]">
          {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={(tab) => setActiveTab(tab)} userAvatarUrl={userAvatarUrl} />}
          {activeTab === 'orders' && <OrdersScreen />}
          {activeTab === 'production' && <ProductionScreen />}
          {activeTab === 'hr' && <HRScreen />}
          {activeTab === 'warehouse' && <InventoryScreen />}
          {activeTab === 'cashflow' && <FinanceScreen />}
          {activeTab === 'affiliate' && <AffiliateScreen />}
          {activeTab === 'analytics' && <AnalyticsScreen />}
        </View>

        {/* Bottom Bar: Chuẩn 4 icon tối giản như bản Web */}
        <View className="bg-[#09090b] border-t border-[#27272a]/70 h-[60px] flex-row justify-around items-center px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setActiveTab(item.id)}
                className="items-center justify-center flex-1 py-1"
              >
                <FontAwesome5
                  name={item.icon}
                  size={17}
                  color={isActive ? '#d4af37' : '#52525b'}
                />
                <Text
                  className={`text-[9px] font-black mt-1 uppercase tracking-wider ${
                    isActive ? 'text-[#d4af37]' : 'text-zinc-500'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMenuOpen(true)}
            className="items-center justify-center flex-1 py-1"
          >
            <FontAwesome5 name="bars" size={17} color="#52525b" />
            <Text className="text-[9px] font-black mt-1 uppercase tracking-wider text-zinc-500">
              Menu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slide Menu Drawer */}
        <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
          <View className="flex-1 bg-black/80 flex-row">
            <View className="w-[280px] bg-[#09090b] border-r border-[#27272a] h-full p-5 justify-between shadow-2xl">
              
              {/* Brand Header */}
              <View className="flex-row justify-between items-center border-b border-[#27272a] pb-4 mb-2">
                <View className="flex-row items-center gap-3">
                  <FontAwesome5 name="water" size={24} color="#0ea5e9" />
                  <View>
                    <Text className="text-white font-black text-lg tracking-tight">Workspace</Text>
                    <Text className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">Royal V2</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)} className="p-1">
                  <FontAwesome5 name="times" size={14} color="#a1a1aa" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Menu Items */}
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* VẬN HÀNH */}
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 mt-2">VẬN HÀNH</Text>
                {[
                  { id: 'dashboard', label: 'Tổng Quan', icon: 'home' },
                  { id: 'orders', label: 'Đơn Hàng', icon: 'shopping-cart' },
                  { id: 'production', label: 'Sản Xuất', icon: 'hammer' },
                  { id: 'kcs', label: 'Lỗi & KCS', icon: 'shield-alt' },
                  { id: 'hr', label: 'Nhân Sự', icon: 'user' },
                  { id: 'docs', label: 'Tài Liệu', icon: 'folder' },
                  { id: '3d', label: 'Trình Chiếu 3D', icon: 'cube' },
                  { id: 'affiliate', label: 'Cộng Tác Viên', icon: 'handshake' },
                ].map((m) => {
                  const isSelected = activeTab === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      activeOpacity={0.8}
                      onPress={() => { setActiveTab(m.id); setIsMenuOpen(false); }}
                      className={`flex-row items-center gap-3 p-2.5 rounded-lg mb-1 ${
                        isSelected ? 'border border-[#d4af37]/40 bg-[#d4af37]/5' : ''
                      }`}
                    >
                      <View className="w-5 items-center justify-center">
                        <FontAwesome5 name={m.icon} size={14} color={isSelected ? '#d4af37' : '#a1a1aa'} />
                      </View>
                      <Text className={`text-[13px] font-bold ${isSelected ? 'text-[#d4af37]' : 'text-zinc-300'}`}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* QUẢN LÝ */}
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-5 mb-2">QUẢN LÝ (KẾ TOÁN & KHO)</Text>
                {[
                  { id: 'analytics', label: 'Phân Tích P&L', icon: 'chart-pie' },
                  { id: 'report', label: 'Báo Cáo KQKD', icon: 'chart-line' },
                  { id: 'warehouse', label: 'Kho Hàng', icon: 'boxes' },
                  { id: 'cashflow', label: 'Tài Chính', icon: 'wallet' },
                  { id: 'partner', label: 'Đối Tác', icon: 'handshake' },
                ].map((m) => {
                  const isSelected = activeTab === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      activeOpacity={0.8}
                      onPress={() => { setActiveTab(m.id); setIsMenuOpen(false); }}
                      className={`flex-row items-center gap-3 p-2.5 rounded-lg mb-1 ${
                        isSelected ? 'border border-[#d4af37]/40 bg-[#d4af37]/5' : ''
                      }`}
                    >
                      <View className="w-5 items-center justify-center">
                        <FontAwesome5 name={m.icon} size={14} color={isSelected ? '#d4af37' : '#a1a1aa'} />
                      </View>
                      <Text className={`text-[13px] font-bold ${isSelected ? 'text-[#d4af37]' : 'text-zinc-300'}`}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Theme Toggle */}
                <View className="flex-row items-center justify-between mt-6 mb-4 px-2">
                  <View className="flex-row items-center gap-3">
                    <FontAwesome5 name="moon" size={14} color="#d4af37" />
                    <Text className="text-zinc-300 text-[13px] font-bold">Theme</Text>
                  </View>
                  <View className="w-8 h-4 rounded-full bg-zinc-700 flex-row items-center px-0.5">
                    <View className="w-3 h-3 rounded-full bg-[#d4af37] translate-x-4" />
                  </View>
                </View>
              </ScrollView>

              {/* Profile & Logout */}
              <View className="border-t border-[#27272a] pt-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-zinc-800 border border-[#d4af37]/40 items-center justify-center overflow-hidden">
                    {userAvatarUrl ? (
                      <Image source={{ uri: userAvatarUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-[#d4af37] font-black text-xs">{currentUser ? currentUser.charAt(0) : 'U'}</Text>
                    )}
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{currentUser}</Text>
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold">{isBoss ? 'TỐI CAO' : userRole || 'Nhân sự'}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleLogout} className="p-2">
                  <FontAwesome5 name="sign-out-alt" size={16} color="#a1a1aa" />
                </TouchableOpacity>
              </View>

            </View>
            <TouchableOpacity className="flex-1" onPress={() => setIsMenuOpen(false)} />
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}
