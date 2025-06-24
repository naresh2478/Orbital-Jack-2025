import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { getTasks } from '../../utils/streakstoragedb';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_DAYS = 21;

const StreakCard = ({ name, streak }) => {
  const progress = (streak / TOTAL_DAYS) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.streak}>Streak: {streak} days</Text>
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

  //useFocusEffect is used to fetch streaks when the screen is focused (reloaded)
  //calls getTasks to load full task array
  //fetch streaks state
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
  streak: {
    fontSize: 16,
    color: '#555',
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
});