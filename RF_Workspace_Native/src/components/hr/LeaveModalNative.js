import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LeaveModalNative({ visible, onClose, onSave, currentUser, users = [], canEditAll = false }) {
  const [targetUser, setTargetUser] = useState(currentUser);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState('Cả Ngày');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!date || !shift) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày và ca nghỉ!');
      return;
    }

    const payload = {
      id: `ATT_LEAVE_${targetUser.replace(/[^a-zA-Z0-9]/g, '_')}_${date.replace(/-/g, '')}`,
      user: targetUser,
      date,
      shift,
      leaveType: 'Nghỉ Phép',
      status: 'Nghỉ có phép',
      penalty: 0,
      note: note.trim(),
      isEdited: false,
      leaveReportAt: new Date().toISOString()
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
              <FontAwesome5 name="calendar-minus" size={14} color="#f43f5e" />
              <Text className="text-white font-semibold text-sm uppercase tracking-wider">TẠO LỆNH BÁO NGHỈ</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
              <FontAwesome5 name="times" size={12} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="p-4 space-y-3">
            {canEditAll && (
              <View>
                <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Nhân sự báo nghỉ</Text>
                <TextInput
                  value={targetUser}
                  onChangeText={setTargetUser}
                  className="bg-[#09090b] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                />
              </View>
            )}

            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Ngày nghỉ (YYYY-MM-DD) *</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-08-28"
                placeholderTextColor="#52525b"
                className="bg-[#09090b] border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono font-semibold text-xs"
              />
            </View>

            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Ca nghỉ *</Text>
              <View className="flex-row gap-1.5">
                {['Cả Ngày', 'Sáng', 'Chiều', 'Tối'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setShift(s)}
                    className={`flex-1 py-2 rounded-xl border items-center ${shift === s ? 'bg-rose-500/20 border-rose-500' : 'bg-[#09090b] border-white/10'}`}
                  >
                    <Text className={`text-xs font-semibold ${shift === s ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Lý do xin nghỉ</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Ghi rõ lý do..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={2}
                className="bg-[#09090b] border border-white/10 rounded-xl p-2.5 text-zinc-200 text-xs"
              />
            </View>
          </View>

          {/* Actions */}
          <View className="p-4 bg-[#121214] border-t border-white/10 flex-row gap-2">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-zinc-800 py-3 rounded-xl items-center">
              <Text className="text-zinc-300 font-semibold text-xs uppercase">Hủy Bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-[2] bg-rose-600 py-3 rounded-xl items-center">
              <Text className="text-white font-semibold text-xs uppercase tracking-wider">Gửi Báo Nghỉ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
