import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getJournalEntries } from '../utils/journalstorage';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Appbar } from 'react-native-paper';

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
    const createdAt = item.createdAt?.toDate?.(); // Firestore timestamp
    const formattedDate = createdAt ? format(createdAt, 'PPpp') : 'Unknown Date';

    return (
      <View style={styles.entryCard}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/Homepage/journaltab')} style={styles.backButton}>
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Past Journal Entries</Text>

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
      />
    </View>
  );
};

export default JournalEntries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 0,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#007BFF',
  },
});
