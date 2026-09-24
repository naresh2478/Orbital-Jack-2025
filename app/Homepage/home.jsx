import React, { useState, useEffect } from 'react';
import {
  Alert, View, Text, ScrollView, TouchableOpacity,
  Platform, Image, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import * as taskAPI from '../../utils/streakstoragedb';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import profileIcon1 from '../../assets/profileicon-nobg.png';
import Logo from '../../assets/ElevateYouLogo.png';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HABIT_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4', '#EF4444', '#14B8A6'];

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
        try { await scheduleNotifications(); } catch (e) {}
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
  const bestStreak = tasks.reduce((max, t) => Math.max(max, t.streak || 0), 0);

  return (
    <View className="flex-1 bg-[#0B1121]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4338ca']}
          style={{ paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <SafeAreaView edges={['top']}>
            <View className="flex-row items-center px-6 pt-3">
              <View className="flex-1">
                <Text className="text-[28px] font-extrabold text-white tracking-tight">
                  {getGreeting()} 👋
                </Text>
                <Text className="text-sm text-white/50 mt-1">
                  {format(new Date(), 'EEEE, MMM d')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/updateduserprofile')}
                className="w-12 h-12 rounded-full bg-white/10 items-center justify-center border-2 border-white/20"
              >
                <Image source={profileIcon1} className="w-8 h-8 rounded-full" />
              </TouchableOpacity>
            </View>

            {/* Stats Card */}
            <View className="mx-5 mt-5 rounded-2xl bg-white/[0.07] overflow-hidden border border-white/[0.08]">
              <View className="flex-row p-4">
                <View className="flex-1 items-center">
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center bg-white/5"
                    style={{ borderWidth: 3, borderColor: '#FBBF24' }}
                  >
                    <Text className="text-lg font-extrabold text-amber-400">{pct}%</Text>
                  </View>
                  <Text className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">
                    Progress
                  </Text>
                </View>

                <View className="w-px bg-white/10" />

                <View className="flex-1 items-center justify-center">
                  <Text className="text-2xl font-extrabold text-emerald-400">
                    {doneCount}
                    <Text className="text-white/30">/{totalCount}</Text>
                  </Text>
                  <Text className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">
                    Done
                  </Text>
                </View>

                <View className="w-px bg-white/10" />

                <View className="flex-1 items-center justify-center">
                  <Text className="text-2xl font-extrabold text-orange-400">
                    🔥 {bestStreak}
                  </Text>
                  <Text className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">
                    Best
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View className="h-1 bg-white/5">
                <View
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </View>
            </View>

            {pct === 100 && totalCount > 0 && (
              <Text className="text-amber-400 text-xs font-semibold text-center mt-3">
                All done! Great work! 🎉
              </Text>
            )}
          </SafeAreaView>
        </LinearGradient>

        {/* Body */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View className="px-5 pt-6">

            {/* Quote */}
            {quote && (
              <View className="bg-[#141D2B] rounded-2xl p-5 mb-6 border border-white/[0.05]">
                <View className="flex-row items-start">
                  <Text className="text-5xl text-violet-500/60 font-black mr-1" style={{ lineHeight: 48 }}>
                    "
                  </Text>
                  <View className="flex-1 pt-2">
                    <Text className="text-[15px] text-slate-300/90 italic" style={{ lineHeight: 23 }}>
                      {quote.q}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-3 font-semibold text-right">
                      — {quote.a}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Section Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-white">Today's Habits</Text>
              {!adding && (
                <TouchableOpacity onPress={() => setAdding(true)} className="overflow-hidden rounded-full">
                  <LinearGradient
                    colors={['#7C3AED', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                  >
                    <Text className="text-white text-[13px] font-bold">+ New</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Empty State */}
            {tasks.length === 0 ? (
              <View className="items-center py-14 bg-[#141D2B] rounded-3xl border border-violet-500/10">
                <Image source={Logo} className="w-20 h-20 mb-4 opacity-40" />
                <Text className="text-lg font-bold text-slate-200">No habits yet</Text>
                <Text className="text-sm text-slate-500 mt-1 text-center px-8">
                  Start your journey — add your first habit!
                </Text>
                <TouchableOpacity onPress={() => setAdding(true)} className="mt-5 overflow-hidden rounded-full">
                  <LinearGradient
                    colors={['#7C3AED', '#A855F7']}
                    style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
                  >
                    <Text className="text-white font-bold text-sm">+ Add First Habit</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              tasks.map((task, idx) => {
                const color = HABIT_COLORS[idx % HABIT_COLORS.length];
                const done = completed[task.name];
                return (
                  <View
                    key={task.id}
                    className="bg-[#141D2B] rounded-2xl mb-3 flex-row overflow-hidden border border-white/[0.04]"
                  >
                    <View className="w-1 rounded-l-2xl" style={{ backgroundColor: done ? '#10B981' : color }} />
                    <View className="flex-1 flex-row items-center py-4 pr-3 pl-4">
                      <View className="flex-1">
                        <Text className={`text-base font-semibold ${done ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {task.name}
                        </Text>
                        {task.streak > 0 && (
                          <View className="flex-row items-center mt-1">
                            <Text className="text-xs text-amber-400 font-medium">
                              🔥 {task.streak} day{task.streak > 1 ? 's' : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Delete Habit', 'Remove this habit permanently?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(task.name) },
                          ])
                        }
                        className="p-2 mr-2"
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleTask(task.name)}
                        className={`w-7 h-7 rounded-full items-center justify-center ${
                          done ? 'bg-emerald-500' : ''
                        }`}
                        style={{
                          borderWidth: 2.5,
                          borderColor: done ? '#10B981' : '#475569',
                        }}
                      >
                        {done && <Text className="text-white text-sm font-extrabold">✓</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Add Habit */}
            {adding && (
              <View className="mt-2 mb-4">
                <TextInput
                  mode="outlined"
                  placeholder="e.g. Drink 8 glasses of water"
                  style={{ backgroundColor: '#141D2B', marginBottom: 12 }}
                  textColor="#E2E8F0"
                  value={newTask}
                  onChangeText={setNewTask}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddTask}
                  outlineColor="#334155"
                  activeOutlineColor="#7C3AED"
                  outlineStyle={{ borderRadius: 14 }}
                  placeholderTextColor="#475569"
                />
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3.5 rounded-xl bg-red-500/10 items-center"
                    onPress={() => { setAdding(false); setNewTask(''); }}
                  >
                    <Text className="text-red-400 font-bold text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 rounded-xl overflow-hidden"
                    onPress={handleAddTask}
                    disabled={!newTask.trim()}
                    style={{ opacity: newTask.trim() ? 1 : 0.4 }}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#A855F7']}
                      style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}
                    >
                      <Text className="text-white font-bold text-sm">Add Habit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sign Out */}
            <TouchableOpacity className="items-center mt-8 py-3" onPress={handleLogout}>
              <Text className="text-slate-600 text-[13px] font-medium">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default Home;

async function scheduleNotifications() {
  if (!Device.isDevice) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  if (existing.length >= 2) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: '☀️ Good morning!', body: 'Time to complete your habits!', sound: true },
    trigger: { hour: 9, minute: 0, repeats: true },
  });
  await Notifications.scheduleNotificationAsync({
    content: { title: '🌙 Good night!', body: 'Did you log your progress today?', sound: true },
    trigger: { hour: 21, minute: 0, repeats: true },
  });
}
