import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function AttendanceWidgetNative({ attendance = [] }) {
  const [activeShift, setActiveShift] = useState('Ca Tối'); // Default active to Ca Tối matching screenshot

  return (
    <View className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 shadow-xl mb-6 relative overflow-hidden">
      {/* Decorative left accent */}
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-2xl" />

      {/* Shifts Tabs */}
      <View className="flex-row gap-2 mb-6 ml-2">
        {/* Ca Sáng */}
        <TouchableOpacity 
          onPress={() => setActiveShift('Ca Sáng')}
          className={`flex-1 rounded-xl p-3 border items-center justify-center ${activeShift === 'Ca Sáng' ? 'border-blue-500 bg-blue-900/10' : 'border-[#27272a] bg-[#09090b]'}`}
        >
          <FontAwesome5 name="cloud-sun" size={12} color="#a1a1aa" className="mb-2" />
          <Text className={`text-[11px] font-semibold uppercase tracking-widest ${activeShift === 'Ca Sáng' ? 'text-blue-400' : 'text-zinc-400'} mb-1`}>Ca Sáng</Text>
          <Text className="text-[8px] text-zinc-500 font-semibold">06:00 - 13:00</Text>
          <View className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-500" />
        </TouchableOpacity>

        {/* Ca Chiều */}
        <TouchableOpacity 
          onPress={() => setActiveShift('Ca Chiều')}
          className={`flex-1 rounded-xl p-3 border items-center justify-center ${activeShift === 'Ca Chiều' ? 'border-blue-500 bg-blue-900/10' : 'border-[#27272a] bg-[#09090b]'}`}
        >
          <FontAwesome5 name="sun" size={12} color="#a1a1aa" className="mb-2" />
          <Text className={`text-[11px] font-semibold uppercase tracking-widest ${activeShift === 'Ca Chiều' ? 'text-blue-400' : 'text-zinc-400'} mb-1`}>Ca Chiều</Text>
          <Text className="text-[8px] text-zinc-500 font-semibold">13:00 - 19:00</Text>
          <View className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-500" />
        </TouchableOpacity>

        {/* Ca Tối */}
        <TouchableOpacity 
          onPress={() => setActiveShift('Ca Tối')}
          className={`flex-1 rounded-xl p-3 border items-center justify-center ${activeShift === 'Ca Tối' ? 'border-blue-500 bg-[#38bdf8]/10' : 'border-[#27272a] bg-[#09090b]'}`}
        >
          <FontAwesome5 name="moon" size={12} color="#38bdf8" className="mb-2" />
          <Text className={`text-[11px] font-semibold uppercase tracking-widest ${activeShift === 'Ca Tối' ? 'text-[#38bdf8]' : 'text-zinc-400'} mb-1`}>Ca Tối</Text>
          <Text className="text-[8px] text-[#38bdf8]/70 font-semibold">19:00 - 06:00</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-6 ml-2">
        <TouchableOpacity className="flex-1 py-3 bg-[#18181b] border border-[#27272a] rounded-xl flex-row items-center justify-center gap-2 active:bg-zinc-800">
          <FontAwesome5 name="sign-in-alt" size={12} color="#a1a1aa" />
          <Text className="text-zinc-400 text-[11px] font-semibold uppercase tracking-widest">Vào Làm</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 bg-[#18181b] border border-zinc-500 rounded-xl flex-row items-center justify-center gap-2 active:bg-zinc-800 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          <FontAwesome5 name="sign-out-alt" size={12} color="white" />
          <Text className="text-white text-[11px] font-semibold uppercase tracking-widest">Ra Về</Text>
        </TouchableOpacity>
      </View>

      {/* Tracking Info */}
      <View className="ml-2">
        <View className="flex-row items-center gap-2 mb-4">
          <FontAwesome5 name="history" size={12} color="#38bdf8" />
          <Text className="text-[#38bdf8] text-[10px] font-semibold uppercase tracking-widest">Giờ làm thực tế hôm nay</Text>
        </View>

        <View className="space-y-4 ml-2 border-l border-[#27272a] pl-4 py-1">
          {/* Sáng */}
          <View className="flex-row items-center justify-between relative">
            <View className="absolute -left-[21px] w-2 h-2 rounded-full bg-zinc-600 border border-[#121214]" />
            <Text className="text-white text-[11px] font-semibold">Ca Sáng</Text>
            <Text className="text-zinc-400 text-[11px] font-mono">07:33 <FontAwesome5 name="arrow-right" size={8} color="#71717a" /> 11:59</Text>
          </View>
          {/* Chiều */}
          <View className="flex-row items-center justify-between relative">
            <View className="absolute -left-[21px] w-2 h-2 rounded-full bg-zinc-600 border border-[#121214]" />
            <Text className="text-white text-[11px] font-semibold">Ca Chiều</Text>
            <Text className="text-zinc-400 text-[11px] font-mono">13:17 <FontAwesome5 name="arrow-right" size={8} color="#71717a" /> 17:21</Text>
          </View>
          {/* Tối */}
          <View className="flex-row items-center justify-between relative">
            <View className="absolute -left-[21px] w-2 h-2 rounded-full bg-[#38bdf8] border border-[#121214] shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
            <Text className="text-white text-[11px] font-semibold">Ca Tối</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-zinc-400 text-[11px] font-mono">23:21 <FontAwesome5 name="arrow-right" size={8} color="#71717a" /></Text>
              <View className="bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 rounded">
                <Text className="text-yellow-400 text-[9px] font-semibold uppercase">Đang làm</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

    </View>
  );
}
