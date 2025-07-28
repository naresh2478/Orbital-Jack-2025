import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { getTasks } from '../../utils/streakstoragedb';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TOTAL_DAYS = 21;

const StreakCard = ({ name, streak }) => {
  const progress = (streak / TOTAL_DAYS) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.streakBadge}>
          <MaterialCommunityIcons name="fire" size={18} color="#ff9800" />
          <Text style={{ color: '#ff9800' }}> Streak: {streak} days</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.counter}>{streak}/{TOTAL_DAYS}</Text>
    </View>
  );
};

const Streaks = () => {
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          Complete a habit for 21 days in a row to earn 50m bonus elevation!
        </Text>
        {streaks.map((task) => (
          <StreakCard key={task.name} name={task.name} streak={task.streak} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Streaks;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
  },
  card: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#526FFF',
    borderRadius: 5,
  },
  counter: {
    textAlign: 'right',
    marginTop: 4,
    color: '#555',
  },
  streakBadge: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 4,
  },
});
