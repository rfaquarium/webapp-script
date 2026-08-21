import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PayrollCardNative({ p, isBoss, canManagePayroll, onAdvanceRequest, onPayrollAction }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMoney = (val) => Math.ceil(Number(val || 0)).toLocaleString('vi-VN');

  return (
    <View className="bg-[#121214] border border-white/10 rounded-2xl p-4 mb-3">
      {/* Header */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center"
      >
        <View className="flex-1 mr-2">
          <Text className="text-white font-semibold text-sm">{p.user}</Text>
          <Text className="text-zinc-500 text-[10px] uppercase font-semibold mt-0.5">{p.role}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[9px] text-[#d4af37] font-semibold uppercase">Thực Nhận Kỳ Này</Text>
          <Text className="text-emerald-400 font-semibold text-base font-mono">
            {formatMoney(p.conCanTra)} đ
          </Text>
        </View>
      </TouchableOpacity>

      {/* Accordion Chi tiết */}
      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-white/5 space-y-2">
          <View className="bg-[#09090b] rounded-xl p-3 border border-white/5 space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-zinc-400 text-xs">Lương Thời Gian ({p.totalGateHours || 0}h):</Text>
              <Text className="text-zinc-200 font-semibold text-xs">{formatMoney(p.luongChinh)} đ</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-zinc-400 text-xs">Lương Chức Vụ / KPI:</Text>
              <Text className="text-purple-400 font-semibold text-xs">{formatMoney(p.funcSalary)} đ</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-zinc-400 text-xs">Hoa Hồng Sản Xuất:</Text>
              <Text className="text-emerald-400 font-semibold text-xs">{formatMoney(p.hoaHongSanXuat)} đ</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-zinc-400 text-xs">Phụ Cấp Xăng Xe:</Text>
              <Text className="text-blue-400 font-semibold text-xs">{formatMoney(p.allowanceConfig)} đ</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-zinc-400 text-xs">Thưởng Nóng / Chuyên Cần:</Text>
              <Text className="text-amber-400 font-semibold text-xs">{formatMoney(p.tongThuong)} đ</Text>
            </View>
            <View className="flex-row justify-between pt-1 border-t border-white/5">
              <Text className="text-rose-400 text-xs font-semibold">Tổng Giảm Trừ / Phạt:</Text>
              <Text className="text-rose-400 font-semibold text-xs">-{formatMoney(p.tongGiamTru)} đ</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 pt-2">
            {canManagePayroll ? (
              <>
                <TouchableOpacity
                  onPress={() => onPayrollAction && onPayrollAction('thuong', p)}
                  className="flex-1 bg-amber-500/20 border border-amber-500/40 py-2 rounded-lg items-center"
                >
                  <Text className="text-amber-400 text-[10px] font-semibold uppercase">Thưởng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onPayrollAction && onPayrollAction('tam_ung', p)}
                  className="flex-1 bg-rose-500/20 border border-rose-500/40 py-2 rounded-lg items-center"
                >
                  <Text className="text-rose-400 text-[10px] font-semibold uppercase">Tạm Ứng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onPayrollAction && onPayrollAction('thanh_toan', p)}
                  className="flex-[1.5] bg-emerald-600 py-2 rounded-lg items-center"
                >
                  <Text className="text-white text-[10px] font-semibold uppercase">Trả Lương</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => onAdvanceRequest && onAdvanceRequest(p)}
                className="w-full bg-rose-500/20 border border-rose-500/40 py-2.5 rounded-xl items-center"
              >
                <Text className="text-rose-400 text-xs font-semibold uppercase">Xin Tạm Ứng</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
