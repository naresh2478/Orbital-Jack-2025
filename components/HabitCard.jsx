import React from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput as RNTextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HABIT_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4', '#EF4444', '#14B8A6'];

export default function HabitCard({
  task,
  index,
  done,
  editing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSubmitEdit,
  onDelete,
  onToggle,
}) {
  const color = HABIT_COLORS[index % HABIT_COLORS.length];

  return (
    <View className="bg-[#141D2B] rounded-2xl mb-3 flex-row overflow-hidden border border-white/[0.04]">
      <View className="w-1 rounded-l-2xl" style={{ backgroundColor: done ? '#10B981' : color }} />
      <View className="flex-1 flex-row items-center py-4 pr-3 pl-4">
        <View className="flex-1">
          {editing ? (
            <RNTextInput
              className="text-base font-semibold text-slate-100 border-b border-violet-500 pb-1"
              value={editName}
              onChangeText={onEditNameChange}
              onSubmitEditing={onSubmitEdit}
              onBlur={onSubmitEdit}
              autoFocus
              returnKeyType="done"
              style={{ color: '#F1F5F9', padding: 0 }}
            />
          ) : (
            <Text className={`text-base font-semibold ${done ? 'text-emerald-400' : 'text-slate-100'}`}>
              {task.name}
            </Text>
          )}
          {task.streak > 0 && (
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-amber-400 font-medium">
                {task.streak} day{task.streak > 1 ? 's' : ''} streak
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onStartEdit} className="p-2">
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete Habit', 'Remove this habit permanently?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ])
          }
          className="p-2 mr-1"
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onToggle}
          className={`w-7 h-7 rounded-full items-center justify-center ${done ? 'bg-emerald-500' : ''}`}
          style={{ borderWidth: 2.5, borderColor: done ? '#10B981' : '#475569' }}
        >
          {done && <Text className="text-white text-sm font-extrabold">✓</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export { HABIT_COLORS };
