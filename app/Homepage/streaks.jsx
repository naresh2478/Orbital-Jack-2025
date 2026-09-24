import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTasks } from '../../utils/habits';
import { useFocusEffect } from 'expo-router';

const TOTAL_DAYS = 21;
const { width: SW } = Dimensions.get('window');
const COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4', '#EF4444', '#14B8A6'];
const MILESTONES = [7, 14, 21];

function DotGrid({ streak, color }) {
  const rows = [
    Array.from({ length: 7 }, (_, i) => i),
    Array.from({ length: 7 }, (_, i) => i + 7),
    Array.from({ length: 7 }, (_, i) => i + 14),
  ];
  const dotW = Math.floor((SW - 120) / 7);

  return (
    <View className="mt-3">
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row items-center mb-1.5 gap-1.5">
          {row.map(day => {
            const filled = day < streak;
            const isMilestone = MILESTONES.includes(day + 1);
            return (
              <View
                key={day}
                className={`rounded-sm ${filled ? '' : 'bg-white/[0.06]'}`}
                style={{
                  width: dotW,
                  height: 10,
                  backgroundColor: filled ? color : undefined,
                  borderWidth: isMilestone ? 1 : 0,
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                {isMilestone && filled && (
                  <Text className="text-white text-[7px] text-center font-extrabold" style={{ lineHeight: 10 }}>
                    ★
                  </Text>
                )}
              </View>
            );
          })}
          <Text className="text-[10px] text-slate-600 font-semibold ml-1.5 w-7">
            {ri === 0 ? 'W1' : ri === 1 ? 'W2' : 'W3'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StreakCard({ name, streak, index }) {
  const color = COLORS[index % COLORS.length];
  const pct = Math.min((streak / TOTAL_DAYS) * 100, 100);
  const complete = streak >= TOTAL_DAYS;

  return (
    <View className="bg-[#141D2B] rounded-2xl mb-4 flex-row overflow-hidden border border-white/[0.04]">
      <View className="w-1.5" style={{ backgroundColor: color }} />
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-[17px] font-bold text-slate-100">{name}</Text>
            <View className="flex-row items-center mt-1.5 gap-2">
              <View
                className="flex-row items-center px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${color}20` }}
              >
                <MaterialCommunityIcons name="fire" size={14} color={color} />
                <Text className="text-[13px] font-semibold ml-1" style={{ color }}>
                  {streak} day{streak !== 1 ? 's' : ''}
                </Text>
              </View>
              {complete && (
                <View className="bg-emerald-500/15 px-2 py-1 rounded-lg">
                  <Text className="text-[9px] font-extrabold text-emerald-400 tracking-widest">
                    COMPLETE
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            className="w-12 h-12 rounded-full items-center justify-center bg-white/[0.03]"
            style={{ borderWidth: 3, borderColor: `${color}40` }}
          >
            <Text className="text-[13px] font-extrabold" style={{ color }}>
              {Math.round(pct)}%
            </Text>
          </View>
        </View>

        {/* Dot Grid */}
        <DotGrid streak={streak} color={color} />

        {/* Progress Bar */}
        <View className="h-1.5 bg-white/[0.06] rounded-full mt-3 overflow-hidden">
          <LinearGradient
            colors={[color, `${color}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${Math.max(pct, 2)}%`, borderRadius: 4 }}
          />
        </View>
        <View className="flex-row justify-between mt-1.5">
          <Text className="text-[11px] text-slate-600 font-medium">Day {streak}</Text>
          <Text className="text-[11px] text-slate-600 font-medium">{TOTAL_DAYS} days</Text>
        </View>
      </View>
    </View>
  );
}

export default function Streaks() {
  const [streaks, setStreaks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchStreaks = async () => {
        const allTasks = await getTasks();
        setStreaks(allTasks);
      };
      fetchStreaks();
    }, [])
  );

  const totalActive = streaks.filter(t => t.streak > 0).length;
  const longest = streaks.reduce((max, t) => Math.max(max, t.streak), 0);

  return (
    <View className="flex-1 bg-[#0B1121]">
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4338ca']}
        style={{ paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <SafeAreaView edges={['top']}>
          <View className="items-center pt-2">
            <Text className="text-4xl">🔥</Text>
            <Text className="text-[26px] font-extrabold text-white mt-1 tracking-tight">Streaks</Text>
            <Text className="text-[13px] text-white/40 mt-1.5 text-center px-10">
              Complete a habit for 21 days to earn 50m bonus elevation
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row mx-5 mt-5 bg-white/[0.07] rounded-2xl p-3.5 border border-white/[0.08]">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-extrabold text-amber-400">{streaks.length}</Text>
              <Text className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-widest">Habits</Text>
            </View>
            <View className="w-px bg-white/10" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-extrabold text-emerald-400">{totalActive}</Text>
              <Text className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-widest">Active</Text>
            </View>
            <View className="w-px bg-white/10" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-extrabold text-orange-400">{longest}</Text>
              <Text className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-widest">Best</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {streaks.length === 0 ? (
          <View className="items-center py-16 bg-[#141D2B] rounded-3xl border border-violet-500/10">
            <Text className="text-5xl mb-3">🌱</Text>
            <Text className="text-lg font-bold text-slate-200">No habits yet</Text>
            <Text className="text-sm text-slate-500 mt-1.5 text-center px-10">
              Add habits on the Home tab to start building streaks
            </Text>
          </View>
        ) : (
          streaks.map((task, idx) => (
            <StreakCard key={task.name} name={task.name} streak={task.streak} index={idx} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
