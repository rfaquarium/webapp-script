import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const KPI_PRESETS = [
  { id: 'khieu_nai', label: '🛡️ Vận hành: Thắng khiếu nại sàn (>60%)', name: 'Tỷ lệ thắng khiếu nại sàn > 60%', target: '60', unit: '%', reward: '875000', penalty: '100000', note: 'Bắt buộc quay video đồng kiểm 6 mặt khi bóc kiện hàng hoàn. Hệ thống tự động quét đơn khiếu nại thắng có tag [KN-THANG].' },
  { id: 'hang_hoan', label: '🔄 Vận hành: Xử lý hàng hoàn (>90%)', name: 'Xử lý hàng huỷ hoàn & gắn trách nhiệm > 90%', target: '90', unit: '%', reward: '750000', penalty: '50000', note: 'Hàng hoàn về kho phải được phân loại và xử lý trong 48h. Tỷ lệ tính trên tổng đơn hoàn phát sinh trong tháng.' },
  { id: 'ban_hang', label: '💰 Bán hàng: Doanh thu chốt đơn (>20tr)', name: 'Doanh thu bán hàng tháng chốt đơn', target: '20000000', unit: 'VNĐ', reward: '500000', penalty: '0', note: 'Hệ thống tự động cộng dồn tổng doanh thu từ tất cả các đơn hàng chốt thành công của nhân sự phụ trách trong kỳ.' },
  { id: 'dong_goi', label: '📦 Đóng gói: Năng suất trước 19:30', name: 'Năng suất Đóng gói hoàn thành trước 19:30', target: '290', unit: 'Kiện', reward: '300000', penalty: '50000', note: 'Hệ thống tự động đếm số đơn hàng đóng gói thành công có đủ 2 ảnh nghiệm thu trước 19:30 hằng ngày.' },
  { id: 'khau_1', label: '🔨 Sản xuất: Năng suất Khâu 1', name: 'Năng suất Khâu 1 (Cắt & Dán / Dựng Khung)', target: '80', unit: 'SP', reward: '300000', penalty: '50000', note: 'Hệ thống tự động đếm số lượng lệnh sản xuất Khâu 1 mà nhân sự hoàn thành đạt chuẩn KCS.' },
  { id: 'khau_2', label: '✨ Sản xuất: Năng suất Khâu 2', name: 'Năng suất Khâu 2 (Gọt Keo & Gia Cố)', target: '80', unit: 'SP', reward: '300000', penalty: '50000', note: 'Hệ thống tự động đếm số lượng lệnh sản xuất Khâu 2 mà nhân sự hoàn thành đạt chuẩn KCS.' },
  { id: 'san_xuat', label: '🏭 Sản xuất: Tổng khâu hoàn thành', name: 'Tổng khâu sản xuất hoàn thành', target: '150', unit: 'SP', reward: '500000', penalty: '0', note: 'Hệ thống tự động quét tổng số khâu (Khâu 1, Khâu 2, Đóng gói) đạt trạng thái Done trong tháng của nhân sự.' }
];

export default function KPIModalNative({ visible, onClose, onSave, users = [], editingKPI = null }) {
  const [user, setUser] = useState('');
  const [kpiName, setKpiName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('%');
  const [reward, setReward] = useState('');
  const [penalty, setPenalty] = useState('');
  const [guide, setGuide] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (editingKPI) {
      setUser(editingKPI.user || '');
      setKpiName(editingKPI.kpiName || '');
      setTarget(editingKPI.target !== undefined ? String(editingKPI.target) : '');
      setUnit(editingKPI.unit || '%');
      setReward(editingKPI.reward !== undefined ? String(editingKPI.reward) : '');
      setPenalty(editingKPI.penalty !== undefined ? String(editingKPI.penalty) : '');
      setGuide(editingKPI.guide || editingKPI.note || '');
      setStartTime(editingKPI.startTime ? String(editingKPI.startTime).slice(0, 10) : '');
      setEndTime(editingKPI.endTime ? String(editingKPI.endTime).slice(0, 10) : '');
    } else {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();

      setUser(users[0] || '');
      setKpiName('');
      setTarget('');
      setUnit('%');
      setReward('');
      setPenalty('0');
      setGuide('');
      setStartTime(`${y}-${m}-01`);
      setEndTime(`${y}-${m}-${lastDay}`);
    }
  }, [editingKPI, visible, users]);

  const handleApplyPreset = (preset) => {
    setKpiName(preset.name);
    setTarget(preset.target);
    setUnit(preset.unit);
    setReward(preset.reward);
    setPenalty(preset.penalty);
    setGuide(preset.note);
  };

  const handleSave = () => {
    if (!user || !kpiName.trim() || !target.trim() || !unit.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đủ Nhân sự, Tên KPI, Chỉ tiêu và Đơn vị tính!');
      return;
    }

    const payload = {
      id: editingKPI?.id || `KPI_${Date.now()}`,
      user,
      kpiName: kpiName.trim(),
      target: Number(target.replace(/[^0-9.-]/g, '')) || 0,
      unit: unit.trim(),
      reward: Number(reward.replace(/[^0-9.-]/g, '')) || 0,
      penalty: Number(penalty.replace(/[^0-9.-]/g, '')) || 0,
      guide: guide.trim(),
      startTime,
      endTime,
      current: editingKPI?.current !== undefined ? editingKPI.current : 0,
      isClaimed: editingKPI?.isClaimed || false,
      lastUpdated: new Date().toISOString()
    };

    onSave && onSave(payload);
    onClose && onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-[#181a20] border border-[#2d3748] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="p-4 border-b border-[#2d3748] bg-[#12141a] flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center">
                <FontAwesome5 name={editingKPI ? 'edit' : 'fire'} size={14} color="#fbbf24" />
              </View>
              <View>
                <Text className="text-white font-semibold text-sm uppercase tracking-wider">
                  {editingKPI ? 'CHỈNH SỬA KPI THÁNG' : 'TẠO KPI THÁNG MỚI'}
                </Text>
                <Text className="text-zinc-400 text-[9px] font-semibold">Đo lường hiệu suất & giải ngân quỹ chức vụ</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
              <FontAwesome5 name="times" size={12} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView className="p-4 space-y-3" showsVerticalScrollIndicator={false}>
            {/* Nhân sự */}
            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Nhân sự nhận KPI *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 py-1">
                {users.map((uName) => {
                  const isSelected = user === uName;
                  return (
                    <TouchableOpacity
                      key={uName}
                      onPress={() => setUser(uName)}
                      className={`px-3 py-1.5 rounded-xl border ${isSelected ? 'bg-amber-500 border-amber-400' : 'bg-[#0e1015] border-[#2d3748]'}`}
                    >
                      <Text className={`text-xs font-semibold ${isSelected ? 'text-black font-semibold' : 'text-zinc-300'}`}>{uName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Presets */}
            <View>
              <Text className="text-[10px] font-semibold text-amber-400 uppercase mb-1">⚡ Loại KPI Mẫu (Chạm để tự điền)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 py-1">
                {KPI_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handleApplyPreset(p)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1e222d] border border-amber-500/40 mr-1"
                  >
                    <Text className="text-[10px] font-semibold text-amber-300">{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Tên mục tiêu */}
            <View>
              <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Tên mục tiêu KPI *</Text>
              <TextInput
                value={kpiName}
                onChangeText={setKpiName}
                placeholder="VD: Năng suất khâu 1 đạt 80 SP..."
                placeholderTextColor="#52525b"
                className="bg-[#0e1015] border border-[#2d3748] rounded-xl px-3 py-2.5 text-white font-semibold text-xs"
              />
            </View>

            {/* Hướng dẫn SOP */}
            <View>
              <Text className="text-[10px] font-semibold text-amber-400 uppercase mb-1">💡 Hướng dẫn thực thi & Nghiệm thu (SOP)</Text>
              <TextInput
                value={guide}
                onChangeText={setGuide}
                placeholder="Mô tả tiêu chuẩn đạt KPI..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={2}
                className="bg-[#0e1015] border border-[#2d3748] rounded-xl p-2.5 text-zinc-200 text-xs"
              />
            </View>

            {/* Target & Unit */}
            <View className="flex-row gap-2">
              <View className="flex-[2]">
                <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Chỉ tiêu (Target) *</Text>
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  placeholder="60, 100..."
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  className="bg-[#0e1015] border border-[#2d3748] rounded-xl px-3 py-2.5 text-amber-400 font-mono font-semibold text-sm"
                />
              </View>
              <View className="flex-[1]">
                <Text className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">Đơn vị *</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="%, SP..."
                  placeholderTextColor="#52525b"
                  className="bg-[#0e1015] border border-[#2d3748] rounded-xl px-3 py-2.5 text-cyan-400 font-semibold text-xs text-center"
                />
              </View>
            </View>

            {/* Thưởng & Phạt */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">Thưởng (VNĐ)</Text>
                <TextInput
                  value={reward}
                  onChangeText={setReward}
                  placeholder="500000"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  className="bg-[#091a13] border border-emerald-500/40 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-semibold text-xs"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-semibold text-rose-400 uppercase mb-1">Phạt vi phạm (VNĐ)</Text>
                <TextInput
                  value={penalty}
                  onChangeText={setPenalty}
                  placeholder="50000"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  className="bg-[#200d11] border border-rose-500/40 rounded-xl px-3 py-2.5 text-rose-400 font-mono font-semibold text-xs"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-4 bg-[#12141a] border-t border-[#2d3748] flex-row gap-2">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-zinc-800 py-3 rounded-xl items-center">
              <Text className="text-zinc-300 font-semibold text-xs uppercase">Hủy Bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-[2] bg-amber-500 py-3 rounded-xl items-center">
              <Text className="text-black font-semibold text-xs uppercase tracking-wider">
                {editingKPI ? 'Cập Nhật KPI' : 'Lưu Thiết Lập KPI'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
