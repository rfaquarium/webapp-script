import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function WorkerPhaseNative({
  item,
  phaseKey,
  phaseConfig,
  currentUser,
  isAdmin,
  updateDeltas,
  limitMins = 30
}) {
  const data = (item.phases || {})[phaseKey] || { status: item[`${phaseKey}_status`] || 'Pending', user: item[`${phaseKey}_user`] || '', start: item[`${phaseKey}_start`], endTime: item[`${phaseKey}_endTime`] };
  
  const isInProgress = data.status === 'In Progress';
  const isDone = data.status === 'Done' || String(data.status).toUpperCase() === 'ĐÃ XONG';
  const isPending = !isInProgress && !isDone;
  
  const userName = data.user ? data.user.split(' ').pop() : 'Chờ nhận việc';
  
  const [processing, setProcessing] = useState(false);

  const parseDateSafe = (val) => {
    if (!val) return NaN;
    const str = String(val).trim().replace(' ', 'T');
    const t = new Date(str).getTime();
    return isNaN(t) ? new Date(val).getTime() : t;
  };

  const durationText = useMemo(() => {
    if (!isDone || !data.start || !data.endTime) return '';
    const startMs = parseDateSafe(data.start);
    const endMs = parseDateSafe(data.endTime);
    if (isNaN(startMs) || isNaN(endMs)) return '';
    const diffMins = Math.round((endMs - startMs) / 60000);
    return `Làm mất ${diffMins}p`;
  }, [isDone, data.start, data.endTime]);

  const handleStartPhase = async () => {
    if (!updateDeltas) return;
    setProcessing(true);
    const startIso = new Date().toISOString();
    await updateDeltas({
      updates: {
        prodItems: [{
          id: item.id,
          phases: {
            [phaseKey]: {
              ...data,
              status: 'In Progress',
              user: currentUser || 'Unknown',
              start: startIso
            }
          }
        }]
      }
    });
    setProcessing(false);
  };

  const handleCompletePhase = async () => {
    if (!updateDeltas) return;
    try {
      // 1. Ask for permission & Take Photo
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Cấp quyền', 'Bạn cần cấp quyền truy cập Camera để báo cáo KCS.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProcessing(true);
        const base64Data = result.assets[0].base64;
        const endIso = new Date().toISOString();
        
        await updateDeltas({
          updates: {
            prodItems: [{
              id: item.id,
              phases: {
                [phaseKey]: {
                  ...data,
                  status: 'Done',
                  endTime: endIso,
                  photoData: base64Data // App script will handle this or we can call upload image api separately
                }
              }
            }]
          }
        });
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể mở Camera. ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View className="bg-[#121214] rounded-2xl p-3 border border-[#27272a] mb-2 flex-row items-center justify-between">
      
      {/* Left Content */}
      <View className="flex-row items-center gap-3 flex-1 mr-2">
        <View className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] items-center justify-center overflow-hidden">
          {isDone || isInProgress ? (
            <Text className="text-[#10b981] font-semibold text-xs">{userName.charAt(0)}</Text>
          ) : (
            <FontAwesome5 name="user" size={14} color="#52525b" />
          )}
        </View>
        
        <View className="flex-1 justify-center">
          <Text className={`text-[10px] font-semibold uppercase tracking-widest ${isDone ? 'text-[#10b981]' : isInProgress ? 'text-amber-400' : 'text-zinc-500'}`}>
            {phaseConfig.n}
          </Text>
          <Text className="text-white text-[13px] font-semibold mt-0.5">
            {isDone || isInProgress ? userName : 'Chờ nhận việc'}
          </Text>
          {isDone && durationText ? (
            <Text className="text-[9px] text-zinc-400 mt-0.5 flex-row items-center font-medium">
              <FontAwesome5 name="clock" size={8} color="#a1a1aa" /> {durationText}
              {data.reward_vnd ? <Text className="text-zinc-500"> (+{data.reward_vnd}đ)</Text> : null}
            </Text>
          ) : isInProgress ? (
             <Text className="text-[9px] text-amber-500 mt-0.5 flex-row items-center font-semibold">
              ĐANG LÀM
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-2">
        {processing ? (
          <ActivityIndicator size="small" color="#d4af37" className="mx-4" />
        ) : isDone ? (
          <>
            <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-lg bg-[#18181b] active:bg-zinc-800">
              <FontAwesome5 name="image" size={10} color="white" />
              <Text className="text-white text-[10px] font-semibold tracking-widest uppercase">Xem ảnh</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity className="w-8 h-8 border border-rose-500/20 rounded-lg bg-rose-500/10 items-center justify-center active:bg-rose-500/20">
                <FontAwesome5 name="undo" size={10} color="#fb7185" />
              </TouchableOpacity>
            )}
          </>
        ) : isInProgress ? (
          <TouchableOpacity 
            onPress={handleCompletePhase}
            className="flex-row items-center gap-2 px-3 py-1.5 border border-amber-500/30 rounded-lg bg-amber-500/20 active:bg-amber-600/30"
          >
            <FontAwesome5 name="camera" size={12} color="#fbbf24" />
            <Text className="text-amber-400 text-[10px] font-bold tracking-widest uppercase">Báo cáo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleStartPhase}
            className="flex-row items-center gap-2 px-4 py-2 border border-white/20 rounded-lg bg-[#18181b] active:bg-zinc-800"
          >
            <FontAwesome5 name="play" size={10} color="white" />
            <Text className="text-white text-[11px] font-semibold tracking-widest uppercase">Nhận làm</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}
