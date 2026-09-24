import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
  Image,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import Logo from '../../assets/ElevateYouLogo.png';
import * as taskAPI from '../../utils/streakstoragedb';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput, IconButton } from 'react-native-paper';
import profileIcon1 from '../../assets/profileicon-nobg.png';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HABIT_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'];
const { width: SW } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [quote, setQuote] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('https://zenquotes.io/api/random')
      .then(res => res.json())
      .then(data => { if (data?.length > 0) setQuote(data[0]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        loadTasks(user.uid);
        try { await taskAPI.setElevation(user.uid); } catch (e) {}
        try { await scheduleNotificationsOnce(); } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  const loadTasks = async () => {
    const loadedTasks = await taskAPI.getTasks();
    setTasks(loadedTasks);
    const today = format(new Date(), 'yyyy-MM-dd');
    const map = {};
    loadedTasks.forEach(t => { map[t.name] = t.lastCompleted === today; });
    setCompleted(map);
  };

  const toggleTask = async (taskName) => {
    await taskAPI.toggleTaskCompletion(taskName);
    const updatedTasks = await taskAPI.getTasks();
    setTasks(updatedTasks);
    const today = format(new Date(), 'yyyy-MM-dd');
    const map = {};
    updatedTasks.forEach(t => { map[t.name] = t.lastCompleted === today; });
    setCompleted(map);
    const uid = auth.currentUser?.uid;
    if (uid) try { await taskAPI.setElevation(uid); } catch (e) {}
  };

  const handleDelete = async (taskName) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await taskAPI.deleteTask(taskName, uid);
    try { await taskAPI.setElevation(uid); } catch (e) {}
    setTasks(prev => prev.filter(t => t.name !== taskName));
    setCompleted(prev => { const c = { ...prev }; delete c[taskName]; return c; });
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || tasks.find(t => t.name === newTask)) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await taskAPI.addTask(newTask, uid);
    const updatedTasks = await taskAPI.getTasks(uid);
    setTasks(updatedTasks);
    setCompleted(prev => ({ ...prev, [newTask]: false }));
    setNewTask('');
    setAdding(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Gradient Header */}
        <LinearGradient colors={['#1e1b4b', '#312e81', '#4338ca']} style={s.headerGrad}>
          <SafeAreaView edges={['top']} style={s.headerInner}>
            <View style={{ flex: 1 }}>
              <Text style={s.greeting}>{getGreeting()} 👋</Text>
              <Text style={s.dateText}>{format(new Date(), 'EEEE, MMM d')}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/updateduserprofile')} style={s.profileBtn}>
              <Image source={profileIcon1} style={s.profileImg} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Progress inside header */}
          <View style={s.progressRow}>
            <View style={s.progressRing}>
              <Text style={s.progressPct}>{pct}%</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.progressLabel}>{doneCount}/{totalCount} habits done today</Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${pct}%` }]} />
              </View>
              {pct === 100 && totalCount > 0 && (
                <Text style={s.allDone}>All done! Great work! 🎉</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View style={s.body}>

            {/* Quote */}
            {quote && (
              <View style={s.quoteCard}>
                <Text style={s.quoteMark}>"</Text>
                <Text style={s.quoteText}>{quote.q}</Text>
                <Text style={s.quoteAuthor}>— {quote.a}</Text>
              </View>
            )}

            {/* Habits */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Today's Habits</Text>
              {!adding && (
                <TouchableOpacity style={s.addPill} onPress={() => setAdding(true)}>
                  <Text style={s.addPillText}>+ New</Text>
                </TouchableOpacity>
              )}
            </View>

            {tasks.length === 0 ? (
              <View style={s.empty}>
                <Image source={Logo} style={s.emptyImg} />
                <Text style={s.emptyTitle}>No habits yet</Text>
                <Text style={s.emptySub}>Start your journey — add your first habit!</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => setAdding(true)}>
                  <Text style={s.emptyBtnText}>+ Add First Habit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              tasks.map((task, idx) => {
                const color = HABIT_COLORS[idx % HABIT_COLORS.length];
                const done = completed[task.name];
                return (
                  <View key={task.id} style={s.habitCard}>
                    <View style={[s.habitDot, { backgroundColor: done ? '#10B981' : color, marginLeft: 0 }]} />
                    <View style={s.habitMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.habitName, done && { color: '#10B981' }]}>
                          {task.name}
                        </Text>
                        {task.streak > 0 && (
                          <View style={s.streakRow}>
                            <Text style={s.streakText}>🔥 {task.streak} day{task.streak > 1 ? 's' : ''}</Text>
                          </View>
                        )}
                      </View>
                      <IconButton
                        icon="trash-can-outline"
                        iconColor="#CBD5E1"
                        size={18}
                        onPress={() =>
                          Alert.alert('Delete Habit', 'Remove this habit permanently?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(task.name) },
                          ])
                        }
                        style={{ margin: 0 }}
                      />
                      <TouchableOpacity
                        onPress={() => toggleTask(task.name)}
                        style={[s.checkBtn, done && s.checkBtnDone]}
                      >
                        {done && <Text style={s.checkMark}>✓</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Add Input */}
            {adding && (
              <View style={s.addSection}>
                <TextInput
                  mode="outlined"
                  placeholder="e.g. Drink 8 glasses of water"
                  style={s.input}
                  value={newTask}
                  onChangeText={setNewTask}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddTask}
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#6366F1"
                  outlineStyle={{ borderRadius: 12 }}
                />
                <View style={s.btnRow}>
                  <TouchableOpacity style={s.cancelBtn} onPress={() => { setAdding(false); setNewTask(''); }}>
                    <Text style={s.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.confirmBtn, !newTask.trim() && { opacity: 0.4 }]}
                    onPress={handleAddTask}
                    disabled={!newTask.trim()}
                  >
                    <LinearGradient colors={['#6366F1', '#8B5CF6']} style={s.confirmGrad}>
                      <Text style={s.confirmText}>Add Habit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sign Out */}
            <TouchableOpacity style={s.signOut} onPress={handleLogout}>
              <Text style={s.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Home;

async function scheduleNotificationsOnce() {
  const hasScheduled = await AsyncStorage.getItem('notificationsScheduled');
  if (hasScheduled) return;
  if (!Device.isDevice) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: '☀️ Good morning!', body: 'Time to complete your habits!', sound: true },
    trigger: { hour: 9, minute: 0, repeats: true },
  });
  await Notifications.scheduleNotificationAsync({
    content: { title: '🌙 Good night!', body: 'Did you log your progress today?', sound: true },
    trigger: { hour: 21, minute: 0, repeats: true },
  });
  await AsyncStorage.setItem('notificationsScheduled', 'true');
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { paddingBottom: 40 },

  headerGrad: { paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  greeting: { fontSize: 26, fontWeight: '800', color: 'white' },
  dateText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  profileBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImg: { width: 30, height: 30, borderRadius: 15 },

  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20, paddingHorizontal: 20,
  },
  progressRing: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 3, borderColor: '#FFD700',
    justifyContent: 'center', alignItems: 'center',
  },
  progressPct: { fontSize: 16, fontWeight: '800', color: '#FFD700' },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3, marginTop: 8, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  allDone: { color: '#FFD700', fontSize: 12, fontWeight: '600', marginTop: 6 },

  body: { paddingHorizontal: 20, paddingTop: 20 },

  quoteCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 24,
    borderLeftWidth: 4, borderLeftColor: '#818CF8',
    shadowColor: '#6366F1', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 16,
    elevation: 4,
  },
  quoteMark: { fontSize: 40, color: '#818CF8', fontWeight: '800', lineHeight: 40, marginBottom: -8 },
  quoteText: { fontSize: 15, color: '#CBD5E1', fontStyle: 'italic', lineHeight: 23 },
  quoteAuthor: { fontSize: 12, color: '#64748B', marginTop: 10, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#E2E8F0' },
  addPill: {
    backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  addPillText: { color: 'white', fontSize: 13, fontWeight: '700' },

  empty: {
    alignItems: 'center', paddingVertical: 48,
    backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
  },
  emptyImg: { width: 80, height: 80, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#CBD5E1' },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' },
  emptyBtn: {
    marginTop: 20, backgroundColor: '#6366F1',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24,
  },
  emptyBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  habitCard: {
    backgroundColor: '#1E293B', borderRadius: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
    elevation: 3,
  },
  habitDot: {
    width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 0,
  },
  habitMain: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingRight: 14, paddingLeft: 20,
  },
  habitName: { fontSize: 16, fontWeight: '600', color: '#E2E8F0' },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  streakText: { fontSize: 12, color: '#FBBF24', fontWeight: '500' },

  checkBtn: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2.5, borderColor: '#475569',
    justifyContent: 'center', alignItems: 'center',
  },
  checkBtnDone: {
    backgroundColor: '#10B981', borderColor: '#10B981',
  },
  checkMark: { color: 'white', fontSize: 14, fontWeight: '800' },

  addSection: { marginTop: 4, marginBottom: 16 },
  input: { backgroundColor: '#1E293B', marginBottom: 12, color: '#E2E8F0' },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center',
  },
  cancelText: { color: '#F87171', fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  confirmGrad: { paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: '700', fontSize: 14 },

  signOut: { alignItems: 'center', marginTop: 28, paddingVertical: 14 },
  signOutText: { color: '#475569', fontSize: 13, fontWeight: '500' },
});
