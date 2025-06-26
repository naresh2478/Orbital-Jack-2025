// elevation.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { SafeAreaView, ScrollView } from 'react-native-safe-area-context';
import { getTasks } from '../../utils/streakstoragedb'; // Adjust the import path as necessary

const Elevation = () => {
  const [elevation, setElevation] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const calculateElevation = async () => {
        const tasks = await getTasks();
        const today = format(new Date(), 'yyyy-MM-dd');
        const completedToday = tasks.filter(task => task.lastCompleted === today);

        const points = completedToday.length * 10;
        setElevation(points);
      };

      calculateElevation();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🏔 Elevation</Text>
        <Text style={styles.count}>+{elevation} points</Text>
        <Text style={styles.note}>Complete tasks to rise higher!</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Elevation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  count: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  note: {
    fontSize: 16,
    color: '#555',
  },
});