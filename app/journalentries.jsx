import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getJournalEntries } from '../utils/journalstorage';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await getJournalEntries();
      setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const renderItem = ({ item }) => {
    const createdAt = item.createdAt?.toDate?.();
    const dateStr = createdAt ? format(createdAt, 'EEEE, MMM d') : 'Unknown';
    const timeStr = createdAt ? format(createdAt, 'h:mm a') : '';

    return (
      <View className="bg-[#141D2B] rounded-2xl mb-4 flex-row overflow-hidden border border-white/[0.04]">
        <View className="w-1.5 bg-amber-700" />
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center">
            <Text
              className="text-sm font-bold text-amber-500"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              {dateStr}
            </Text>
            <Text className="text-xs text-slate-500 italic">{timeStr}</Text>
          </View>
          <View className="h-px bg-white/[0.04] my-2.5" />
          <Text
            className="text-base text-slate-300"
            style={{
              lineHeight: 24,
              fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            }}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0B1121]">
      <LinearGradient
        colors={['#78350f', '#92400e', '#b45309']}
        style={{ paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <SafeAreaView edges={['top']}>
          {/* Back button — in flow, not absolute */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center px-5 py-2.5 self-start"
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FDE68A" />
            <Text className="text-amber-200 text-[15px] font-medium ml-0.5">Back</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-4xl">📚</Text>
            <Text className="text-[22px] font-extrabold text-amber-300 mt-1 tracking-tight">
              Past Entries
            </Text>
            <Text className="text-[13px] text-white/40 mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-16 bg-[#141D2B] rounded-3xl border border-amber-800/10">
              <Text className="text-5xl mb-3">📝</Text>
              <Text className="text-lg font-bold text-slate-200">No entries yet</Text>
              <Text className="text-sm text-slate-500 mt-1.5 text-center px-10">
                Your journal entries will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default JournalEntries;
