import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../assets/ElevateYouLogo.png'; // update path if needed

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (task) => {
    setCompleted({ ...completed, [task]: !completed[task] });
  };

  const handleAddTask = () => {
    if (newTask.trim() !== '' && !tasks.includes(newTask)) {
      setTasks([...tasks, newTask]);
      setCompleted({ ...completed, [newTask]: false });
      setNewTask('');
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
        <Image source={Logo} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today’s Tasks</Text>

          {tasks.length === 0 && (
            <Text style={styles.noTasks}>
              No habits yet. Add one below!
            </Text>
          )}

          {tasks.map((task) => (
            <TouchableOpacity
              key={task}
              style={[
                styles.taskButton,
                completed[task] && styles.taskButtonCompleted,
              ]}
              onPress={() => toggleTask(task)}
            >
              <Text style={styles.taskText}>
                {completed[task] ? `✅ ${task}` : task}
              </Text>
            </TouchableOpacity>
          ))}

          {adding ? (
            <View style={styles.addSection}>
              <TextInput
                placeholder="Enter new habit..."
                style={styles.input}
                value={newTask}
                onChangeText={setNewTask}
              />
              <TouchableOpacity onPress={handleAddTask} style={styles.confirmBtn}>
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.addNew} onPress={() => setAdding(true)}>
              + Add new habit
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F5F5F5',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  card: {
    width: 320,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  noTasks: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#888',
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
    fontWeight: '500',
  },
  addSection: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
});

export default Home;
