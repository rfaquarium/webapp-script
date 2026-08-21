import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TaskModalNative({ visible, onClose, onSave, users = [] }) {
  const [user, setUser] = useState(users[0] || '');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('Lần');
  const [rewardXu, setRewardXu] = useState('50');
  const [penaltyVnd, setPenaltyVnd] = useState('0');

  const handleSave = () => {
    if (!user || !title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn nhân sự và nhập tiêu đề nhiệm vụ!');
      return;
    }

    const payload = {
      id: `KPI_XU_${Date.now()}`,
      user,
      title: title.trim(),
      note: note.trim(),
      target: Number(target) || 1,
      unit: unit.trim() || 'Xu',
      amount: Number(rewardXu) || 0,
      penalty: Number(penaltyVnd) || 0,
      type: 'XU_REWARD',
      startTime: new Date().toISOString().slice(0, 10),
      endTime: new Date().toISOString().slice(0, 10)
    };

    onSave && onSave(payload);
    onClose && onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="p-4 border-b border-white/10 bg-[#121214] flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <FontAwesome5 name="coins" size={14} color="#f59e0b" />
              <Text className="text-white font-semibold text-sm uppercase tracking-wider">GIAO NHIỆM VỤ (XU)</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
              <FontAwesome5 name="times" size={12} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView className="p-4 space-y-3">
            {/* Nhân sự */}
            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Người thực hiện *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 py-1">
                {users.map((uName) => {
                  const isSelected = user === uName;
                  return (
                    <TouchableOpacity
                      key={uName}
                      onPress={() => setUser(uName)}
                      className={`px-3 py-1.5 rounded-xl border ${isSelected ? 'bg-amber-500 border-amber-400' : 'bg-[#09090b] border-white/10'}`}
                    >
                      <Text className={`text-xs font-semibold ${isSelected ? 'text-black font-semibold' : 'text-zinc-300'}`}>{uName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tiêu đề */}
            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Tiêu đề nhiệm vụ *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="VD: Dọn dẹp vệ sinh kho bãi, kiểm kê..."
                placeholderTextColor="#52525b"
                className="bg-[#09090b] border border-white/10 rounded-xl px-3 py-2.5 text-white font-semibold text-xs"
              />
            </View>

            {/* Mô tả */}
            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Mô tả chi tiết</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Yêu cầu cụ thể..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={2}
                className="bg-[#09090b] border border-white/10 rounded-xl p-2.5 text-zinc-200 text-xs"
              />
            </View>

            {/* Thưởng Xu & Phạt */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-[10px] font-semibold text-amber-400 uppercase mb-1">Thưởng hoàn thành (XU)</Text>
                <TextInput
                  value={rewardXu}
                  onChangeText={setRewardXu}
                  placeholder="50"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  className="bg-[#14120c] border border-amber-500/40 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-semibold text-xs"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-semibold text-rose-400 uppercase mb-1">Phạt quá hạn (VNĐ)</Text>
                <TextInput
                  value={penaltyVnd}
                  onChangeText={setPenaltyVnd}
                  placeholder="0"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  className="bg-[#200d11] border border-rose-500/40 rounded-xl px-3 py-2.5 text-rose-400 font-mono font-semibold text-xs"
                />
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="p-4 bg-[#121214] border-t border-white/10 flex-row gap-2">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-zinc-800 py-3 rounded-xl items-center">
              <Text className="text-zinc-300 font-semibold text-xs uppercase">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-[2] bg-emerald-600 py-3 rounded-xl items-center">
              <Text className="text-white font-semibold text-xs uppercase tracking-wider">Giao Việc Ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
