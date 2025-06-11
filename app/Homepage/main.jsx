import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../assets/ElevateYouLogo.png';
import {
  getTasks,
  addTask,
  toggleTaskCompletion,
  deleteTask,
} from '../../utils/streakstorage';
import { format } from 'date-fns';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      const stored = await getTasks();
      setTasks(stored);

      // Determine which tasks were completed today
      const today = format(new Date(), 'yyyy-MM-dd');
      const completedMap = {};
      stored.forEach(task => {
        completedMap[task.name] = task.lastCompleted === today;
      });
      setCompleted(completedMap);
    };

    loadTasks();
  }, []);

  const toggleTask = async (taskName) => {
    const updated = !completed[taskName];
    setCompleted({ ...completed, [taskName]: updated });
    await toggleTaskCompletion(taskName);

    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const handleDelete = async (taskName) => {
    await deleteTask(taskName);
    const updatedTasks = tasks.filter((t) => t.name !== taskName);
    setTasks(updatedTasks);
    const updatedCompleted = { ...completed };
    delete updatedCompleted[taskName];
    setCompleted(updatedCompleted);
  };

  const handleAddTask = async () => {
    if (newTask.trim() !== '' && !tasks.find(t => t.name === newTask)) {
      await addTask(newTask);
      const updatedTasks = await getTasks();
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
                key={task.name}
                style={[
                  styles.taskRow,
                  completed[task.name] && styles.taskRowCompleted
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
    width: '90%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
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
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#EEE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  taskRowCompleted: {
    backgroundColor: '#B4F8C8',
  },
  taskButton: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  deleteIcon: {
    marginLeft: 12,
    fontSize: 20,
    color: 'gray',
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
