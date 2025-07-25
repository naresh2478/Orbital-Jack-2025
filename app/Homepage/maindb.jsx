import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  //Text,
  TouchableOpacity,
  //TextInput,
  Platform,
  Image,
  Switch
} from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Logo from '../../assets/ElevateYouLogo.png';
import * as taskAPI from '../../utils/streakstoragedb'; // import the backend functions 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { 
  Text, TextInput, Button,  
  Card, Checkbox, IconButton, useTheme
} from 'react-native-paper';

import profileIcon1 from '../../assets/profileicon-nobg.png';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';



const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');

  const [quote, setQuote] = useState(null); //Quote function

  const theme = useTheme();

  const router = useRouter(); //for logout routing

  useEffect(() => {
    // Fetch motivational quote once on mount
    fetch('https://zenquotes.io/api/random')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setQuote(data[0]);
        }
      })
      .catch(err => console.error('Quote fetch error:', err));
  }, []);

  
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

      try {
            await scheduleNotificationsOnce();
            console.log('✅ Notifications function called');
          } catch (error) {
            console.error('Notification scheduling failed:', error);
          }//schedule notifications once when user logs in (happens once only)

    } else {
      console.log('❌ Not logged in');
    }
  });

  return () => 
    unsubscribe(); 
  ;// cleanup listener on unmount
  }, []);

  
  
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

  //handle user logout
  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email;

      await signOut(auth);
      router.push('/'); // Redirect to login screen
      console.log(`Successfully logged out${userEmail ? ` as: ${userEmail}` : ''}`);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', error.message);
    }
  };

//this still doesnt work, to test again
async function scheduleNotificationsOnce() {
  // Debug: Uncomment to force rescheduling during testing
  // await AsyncStorage.removeItem('notificationsScheduled');

  const hasScheduled = await AsyncStorage.getItem('notificationsScheduled');
  if (hasScheduled) return;

  if (!Device.isDevice) {
    console.log("Notifications require a physical device");
    return;
  }

  // 1. Verify permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Notifications blocked", "Enable them in settings");
    return;
  }

  // 2. Clear existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 3. Schedule with timezone
  const morningTrigger = {
    hour: 9,
    minute: 0,
    repeats: true,
  };

  const eveningTrigger = {
    hour: 20, // 9 PM in 24-hour format
    minute: 39,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Good morning!',
      body: 'Time to complete your habits!',
      sound: true,
    },
    trigger: morningTrigger,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Good night!',
      body: "Did you log your progress today?",
      sound: true,
    },
    trigger: eveningTrigger,
  });

  // 4. Verify and store flag
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Scheduled notifications:", scheduled);

  await AsyncStorage.setItem('notificationsScheduled', 'true');
}

//test notification function. Uncomment here and in the return statement to test
// const triggerTestNotification = async () => {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: 'TEST',
//       body: 'This should appear immediately!',
//       sound: 'default',
//     },
//     trigger: { seconds: 2 }, // Shows after 2 seconds
//   });
//   Alert.alert('Test scheduled', 'Notification should appear in 2 seconds (keep app in background)');
// };

  return (
        <SafeAreaView edges={['right']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView contentContainerStyle={styles.container}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 2 }}>
                    <TouchableOpacity onPress={() => router.push('/updateduserprofile')}
                       style={{  alignItems: 'center'}}
                      >
                      
                      <Image
                      source={profileIcon1}
                      style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: 'transparent', 
                        marginBottom: '-5'
                      }}
                      />
                      <Text>Profile</Text>
                      </TouchableOpacity>
                  </View>
              <Image source={Logo} style={styles.logo} />

              {quote && (
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>"{quote.q}"</Text>
                  <Text style={styles.quoteAuthor}>- {quote.a}</Text>
                </View>
              )}

              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleLarge" style={styles.cardTitle}>Today's Habits</Text>
                    <View style={styles.progressCircle}>
                      <Text variant="bodyMedium" style={styles.progressText}>
                        {Object.values(completed).filter(value => value === true).length}/{tasks.length}
                      </Text>
                    </View>
                  </View>

                  {tasks.length === 0 ? ( //Screen when no tasks are present
                    <View style={styles.emptyState}>
                      <Text variant="bodyMedium" style={styles.emptyText}>No habits yet</Text>
                      <Text variant="bodySmall" style={styles.emptySubtext}>Start building your routine</Text>
                    </View>
                  ) : (
                    <View style={styles.habitList}>
                      {tasks.map((task) => (
                        <Card key={task.id} style={[
                          styles.habitItem,
                          completed[task.name] && styles.habitItemCompleted
                        ]}>
                          
                              <View style={styles.habitContent}>
                                <Text 
                                  variant="bodyLarge" 
                                  style={[
                                    styles.habitText,
                                    completed[task.name] && styles.habitTextCompleted //habitText style when completed
                                  ]}
                                >
                                  {task.name}
                                </Text>
                                <IconButton
                            icon="trash-can"
                            iconColor = 'gray'
                            size={20}
                            onPress={() => 
                              Alert.alert(
                                'Delete Habit',
                                'Are you sure you want to remove this habit permanently?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { 
                                    text: 'Delete', 
                                    style: 'destructive',
                                    onPress: () => handleDelete(task.name)
                                  }
                                ]
                              )
                            }
                            style={styles.deleteButton}
                          />
                                <Switch
                                  value={completed[task.name]}           // boolean true/false
                                  onValueChange={() => toggleTask(task.name)}
                                  color="#10B981"                       // switch color when ON
                                />
                                
                              </View>
                          
                        </Card>
                      ))}
                    </View>
                  )}

                  {adding ? (
                    <View style={styles.addSection}>
                      <TextInput
                        mode="outlined"
                        placeholder="What habit are you building?"
                        style={styles.input}
                        value={newTask}
                        onChangeText={setNewTask}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleAddTask}
                        outlineColor='#CBD5E1'
                        activeOutlineColor='#3B82F6'
                      />
                      <View style={styles.buttonGroup}>
                        <Button 
                          mode="outlined"
                          style={styles.secondaryButton}
                          labelStyle={{ color: 'black' }}
                          onPress={() => setAdding(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          mode="contained"
                          style={styles.primaryButton} //Add button -> change to green
                          onPress={handleAddTask}
                          disabled={!newTask.trim()}
                        >
                          Add Habit
                        </Button>
                      </View>
                    </View>
                  ) : (
                    <Button 
                      mode="contained"
                      icon="plus"
                      style={styles.addButton}
                      onPress={() => setAdding(true)}
                    >
                      New Habit
                    </Button>
                  )}
                </Card.Content>
              </Card>

              <View style={styles.signOutContainer}>
                <Button 
                  mode="text"
                  onPress={handleLogout}
                  icon="logout"
                  textColor={theme.colors.error}
                  style={styles.signOutButton}
                >
                  Sign Out
                </Button>
              </View>
            </ScrollView>
            {/* <Button  // Uncomment to test notification 
                  mode="contained" 
                  onPress={triggerTestNotification}
                  style={{ marginTop: 20 }}
                >
                  Test Notification Now
                </Button> */}
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
  };

export default Home;


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 5,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  quoteContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#4B5563', // cool gray
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  cardTitle: {
    color: '#1E293B',
    fontWeight: 'bold',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#94A3B8',
  },
  habitList: {
    marginBottom: 8,
  },
  habitItem: {
    marginVertical: 4,
    padding: 0,
    backgroundColor: '#F8FAFC',
  },
  habitItemCompleted: {
    backgroundColor: '#F0FDF4',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  habitText: {
    flex: 1,
    color: '#1E293B',
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '500',
  },
  habitTextCompleted: {
    color: '#10B981',
    
  },
  deleteButton: {
    margin: 0,
  },
  addSection: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    flex: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FCA5A5',
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#3B82F6',
  },
  signOutContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  signOutButton: {
    width: '100%',
  },
});