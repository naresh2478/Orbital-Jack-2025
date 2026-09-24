import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

  const renderItem = ({ item, index }) => {
    const createdAt = item.createdAt?.toDate?.();
    const dateStr = createdAt ? format(createdAt, 'EEEE, MMM d') : 'Unknown';
    const timeStr = createdAt ? format(createdAt, 'h:mm a') : '';

    return (
      <View style={s.entryCard}>
        <View style={s.entrySpine} />
        <View style={s.entryBody}>
          <View style={s.entryHeader}>
            <Text style={s.entryDate}>{dateStr}</Text>
            <Text style={s.entryTime}>{timeStr}</Text>
          </View>
          <View style={s.entryDivider} />
          <Text style={s.entryContent}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#92400e', '#78350f', '#451a03']} style={s.headerGrad}>
        <SafeAreaView edges={['top']} style={s.headerInner}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backArrow}>‹</Text>
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>📚 Past Entries</Text>
          <Text style={s.headerSub}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#92400e" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyTitle}>No entries yet</Text>
              <Text style={s.emptySub}>Your journal entries will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default JournalEntries;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDF6EC' },

  headerGrad: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: { paddingTop: 8 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backArrow: { fontSize: 28, color: '#FFD700', fontWeight: '300', marginRight: 2, lineHeight: 28 },
  backText: { fontSize: 15, color: '#FFD700', fontWeight: '500' },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: '#FFD700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'center' },

  list: { padding: 20, paddingBottom: 40 },

  entryCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 4,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8D5B8',
    shadowColor: '#78350f',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  entrySpine: {
    width: 5,
    backgroundColor: '#92400e',
  },
  entryBody: {
    flex: 1,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  entryTime: {
    fontSize: 12,
    color: '#A0845C',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  entryDivider: {
    height: 1,
    backgroundColor: 'rgba(196,168,130,0.3)',
    marginVertical: 10,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A3728',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18, fontWeight: '700', color: '#78350f',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySub: {
    fontSize: 14, color: '#A0845C', marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
