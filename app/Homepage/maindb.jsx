import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Button
} from 'react-native';

import { format } from 'date-fns';
import Logo from '../../assets/ElevateYouLogo.png';
import * as taskAPI from '../../utils/streakstoragedb'; // import the backend functions 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import profileIcon from '../../assets/profileicon.jpg';
import { useRouter } from 'expo-router'; //added
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';



const Home = () => {
  const router = useRouter(); //added
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Load tasks and set completed map on mount
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user.uid) {
      console.log('✅ Logged in as:', user.email);
      loadTasks(user.uid); // only load tasks when user is authenticated
      try {
        await taskAPI.setElevation(user.uid); // Initialize elevation for new user
      } catch (error) {
        console.error('Error getting elevation:', error);
      }

    } else {
      console.log('❌ Not logged in');
    }
  });

  return () => 
    unsubscribe(); 
  ;// cleanup listener on unmount
  }, []);

  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        loadTasks(uid);
      }
    }, [])
  );


// Define loadTasks outside useEffect so it's accessible
const loadTasks = async (uid) => {
  const loadedTasks = await taskAPI.getTasks(uid);

  setTasks(loadedTasks);

  const today = format(new Date(), 'yyyy-MM-dd');
  const completedMap = {};
  loadedTasks.forEach(task => {
    completedMap[task.name] = task.lastCompleted === today;
  });
  setCompleted(completedMap);


};

  // Toggle task and reload tasks
  const toggleTask = async (taskName) => {
    console.log('Tapped task:', taskName);
    await taskAPI.toggleTaskCompletion(taskName);

    // Refresh
    const updatedTasks = await taskAPI.getTasks();  //removed the argument
    setTasks(updatedTasks);

    const today = format(new Date(), 'yyyy-MM-dd');
    const completedMap = {};
    updatedTasks.forEach(task => {
      completedMap[task.name] = task.lastCompleted === today;
    });
    setCompleted(completedMap);

    // Update elevation after toggle
    const uid = auth.currentUser?.uid;
    try {
      await taskAPI.setElevation(uid);
    } catch (error) {
      console.error('Error updating elevation:', error);
    }
  };

  // Delete task locally and remotely
  const handleDelete = async (taskName) => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    console.warn('No user signed in. Cannot delete task.');
    return;
  }

  await taskAPI.deleteTask(taskName, uid);

  try {
      await taskAPI.setElevation(uid);
      console.log('Elevation updated after toggling task');
    } catch (error) {
      console.error('Error updating elevation:', error);
    }

  // Update local tasks state after deletion
  const updatedTasks = tasks.filter((t) => t.name !== taskName);
  setTasks(updatedTasks);

  const updatedCompleted = { ...completed };
  delete updatedCompleted[taskName];
  setCompleted(updatedCompleted);
  console.log(`Task "${taskName}" deleted successfully.`);

  };

  // Add new task
  const handleAddTask = async () => {
    console.log('Trying to add:', newTask);

    try {
    if (newTask.trim() !== '' && !tasks.find(t => t.name === newTask)) {
      const uid = auth.currentUser?.uid;
      console.log('Current UID:', uid); // Add this debug log
      
      if (!uid) {
        console.warn('No user logged in!');
        return;
      }

      await taskAPI.addTask(newTask, uid); 
      console.log('Task added to Firestore');

      const updatedTasks = await taskAPI.getTasks(uid);
      setTasks(updatedTasks);

      setCompleted({ ...completed, [newTask]: false });
      setNewTask('');
      setAdding(false);
    }
    } catch (error) {
    console.error('Error adding task:', error);
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

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
            <TouchableOpacity onPress={() => router.push('/Homepage/userprofile')}>
              <Image
              source={profileIcon}
              style={{ width: 30, height: 30 }}
              />
              </TouchableOpacity>
           </View>

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

                <TouchableOpacity onPress={() =>
                          Alert.alert(
                            'Confirm Delete',
                            'Are you sure you want to remove this task?',
                            [
                              {
                                text: 'Keep',
                                style: 'cancel', // Does nothing, just closes the popup
                              },
                              {
                                text: 'Remove',
                                style: 'destructive', // Optional, makes it red on iOS
                                onPress: () => handleDelete(task.name), // Only triggers delete
                              },
                            ],
                            { cancelable: true }
                          )
                        }
                  >
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
