import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../assets/goat.png'; // update path to match your asset location

const Home = () => {
  const [completed, setCompleted] = useState({
    Run: false,
    Read: false,
    Sleep: false
  });

  const toggleTask = (task) => {
    setCompleted({ ...completed, [task]: !completed[task] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image source={Logo} style={styles.logo} />

      {/* Today’s Tasks Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Tasks</Text>

        {["Run", "Read", "Sleep"].map((task) => (
          <TouchableOpacity
            key={task}
            style={[
              styles.taskButton,
              completed[task] && styles.taskButtonCompleted
            ]}
            onPress={() => toggleTask(task)}
          >
            <Text style={styles.taskText}>
              {completed[task] ? `✅ ${task}` : task}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.addNew}>+ Add new habit</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F5F5F5',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain'
  },
  card: {
    width: 300,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  taskButton: {
    backgroundColor: '#EEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  taskButtonCompleted: {
    backgroundColor: '#B4F8C8',
  },
  taskText: {
    fontSize: 16,
  },
  addNew: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Home;
