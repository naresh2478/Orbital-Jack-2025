import AsyncStorage from '@react-native-async-storage/async-storage';


import { format } from 'date-fns'; // for date handling (optional)

const TASKS_KEY = 'tasks';

/**
 * Get all tasks with their streak data from AsyncStorage backend
 *  
 */
export const getTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading tasks:', e);
    return [];
  }
};

/**
 * Save all tasks to AsyncStorage to persist data
 */
export const saveTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

/**
 * Add a new task
 */
export const addTask = async (taskName) => {
  const tasks = await getTasks();
  if (tasks.find((t) => t.name === taskName)) return;

  tasks.push({
    name: taskName,
    lastCompleted: null,
    streak: 0,
  });

  await saveTasks(tasks);
};

/**
 * Toggle completion and update streak
 */
export const toggleTaskCompletion = async (taskName) => {
  const tasks = await getTasks();
  const today = format(new Date(), 'yyyy-MM-dd');

  const updatedTasks = tasks.map((task) => {
    if (task.name === taskName) {
      if (task.lastCompleted === today) {
        // Already completed today → unmark
        return {
          ...task,
          lastCompleted: null,
          streak: Math.max(task.streak - 1, 0),
        };
      }

      const yesterday = format(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        'yyyy-MM-dd'
      );

      const newStreak =
        task.lastCompleted === yesterday ? task.streak + 1 : 1;

      return {
        ...task,
        lastCompleted: today,
        streak: newStreak,
      };
    }
    return task;
  });

  await saveTasks(updatedTasks);
};

/**
 * Get current streak count for a specific task
 */
export const getStreak = async (taskName) => {
  const tasks = await getTasks();
  const task = tasks.find((t) => t.name === taskName);
  return task ? task.streak : 0;
};




