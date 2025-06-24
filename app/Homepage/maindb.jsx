import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
} from 'react-native';

import { format } from 'date-fns';
import Logo from './assets/logo.png'; // adjust path
import * as taskAPI from './firebaseTasks'; // import the backend functions

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Load tasks and set completed map on mount
  useEffect(() => {
    const loadTasks = async () => {
      const loadedTasks = await taskAPI.getTasks();

      setTasks(loadedTasks);

      const today = format(new Date(), 'yyyy-MM-dd');
      const completedMap = {};
      loadedTasks.forEach(task => {
        completedMap[task.name] = task.lastCompleted === today;
      });
      setCompleted(completedMap);
    };

    loadTasks();
  }, []);

  // Toggle task and reload tasks
  const toggleTask = async (taskName) => {
    await taskAPI.toggleTaskCompletion(taskName);

    // Refresh
    const updatedTasks = await taskAPI.getTasks();
    setTasks(updatedTasks);

    const today = format(new Date(), 'yyyy-MM-dd');
    const completedMap = {};
    updatedTasks.forEach(task => {
      completedMap[task.name] = task.lastCompleted === today;
    });
    setCompleted(completedMap);
  };

  // Delete task locally and remotely
  const handleDelete = async (taskName) => {
    await taskAPI.deleteTask(taskName);
    const updatedTasks = tasks.filter((t) => t.name !== taskName);
    setTasks(updatedTasks);

    const updatedCompleted = { ...completed };
    delete updatedCompleted[taskName];
    setCompleted(updatedCompleted);
  };

  // Add new task
  const handleAddTask = async () => {
    if (newTask.trim() !== '' && !tasks.find(t => t.name === newTask)) {
      await taskAPI.addTask(newTask);

      const updatedTasks = await taskAPI.getTasks();
      setTasks(updatedTasks);

      setCompleted({ ...completed, [newTask]: false });
      setNewTask('');
      setAdding(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image source={Logo} style={styles.logo} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today’s Habits</Text>

            {tasks.length === 0 && (
              <Text style={styles.noTasks}>No habits yet. Add one below!</Text>
            )}

            {tasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskRow,
                  completed[task.name] && styles.taskRowCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.taskButton}
                  onPress={() => toggleTask(task.name)}
                >
                  <Text style={styles.taskText}>
                    {completed[task.name] ? `✅ ${task.name}` : task.name}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(task.name)}>
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))}

            {adding ? (
              <View style={styles.addSection}>
                <TextInput
                  placeholder="Enter new habit..."
                  style={styles.input}
                  value={newTask}
                  onChangeText={setNewTask}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddTask}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Home;
