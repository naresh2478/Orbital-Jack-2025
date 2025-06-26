import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { Alert } from 'react-native';


const TASKS_KEY = 'tasks';

// Get all tasks with their streak data
export const getTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading tasks:', e);
    return [];
  }
};

// Save all tasks to AsyncStorage
export const saveTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

// Add a new task if it doesn't exist
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

// Toggle task completion and update streak accordingly
export const toggleTaskCompletion = async (taskName) => {
  const tasks = await getTasks();
  const today = format(new Date(), 'yyyy-MM-dd');

  const updatedTasks = tasks.map((task) => {
    if (task.name === taskName) {
      if (task.lastCompleted === today) {
        const updatedStreak = Math.max(task.streak - 1, 0);
        let newLastCompleted = null;
        if (updatedStreak > 0) {
          const previousDate = new Date();
          previousDate.setDate(previousDate.getDate() - updatedStreak);
          newLastCompleted = format(previousDate, 'yyyy-MM-dd');
        }

        return {
          ...task,
          lastCompleted: newLastCompleted,
          streak: updatedStreak,
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

// Get the streak for a specific task
export const getStreak = async (taskName) => {
  const tasks = await getTasks();
  const task = tasks.find((t) => t.name === taskName);
  return task ? task.streak : 0;
};

// Delete a task completely
export const deleteTask = async (taskName) => {
  const tasks = await getTasks();
  const updated = tasks.filter((t) => t.name !== taskName);
  await saveTasks(updated);
};