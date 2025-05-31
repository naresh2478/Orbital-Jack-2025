import AsyncStorage from '@react-native-async-storage/async-storage';


import { format } from 'date-fns'; // for date handling (optional)

const TASKS_KEY = 'tasks';

/**
 * Get all tasks with their streak data from AsyncStorage backend
 *  
 */

//getTasks reads the saved tasks array from AsyncStorage (under key "tasks")
//returns the array or empty array
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

//reads current tasks from AsyncStorage, checks if taskName already exists
//if taskName does not exist, set streak = 0
//save update list
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

//reads tasks and updates lastCompleted and streaks fields
//if last completed yesterday, increment streak
//else, reset streak to 1
//saves updated tasks back to AsyncStorage
export const toggleTaskCompletion = async (taskName) => {
  const tasks = await getTasks();
  const today = format(new Date(), 'yyyy-MM-dd');

  const updatedTasks = tasks.map((task) => {
    if (task.name === taskName) {
        if (task.lastCompleted === today) {
            // Already completed today → unmark
          
            const updatedStreak = Math.max(task.streak - 1, 0);
           //when unchecking from today, Last completed should be set to yesterday
           //not reset to 0
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

  await saveTasks(updatedTasks); //writes back to AsyncStorage
};

//reads all tasks from AsyncStorage and finds the task with the given name
//returns the streak of that task, or 0 if not found
export const getStreak = async (taskName) => {
  const tasks = await getTasks();
  const task = tasks.find((t) => t.name === taskName);
  return task ? task.streak : 0;
};




