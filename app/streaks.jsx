import { ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useState, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTasks } from '../utils/streakstorage.js';


const Streaks = () => {
  const [streaks, setStreaks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchStreaks = async () => {
        const allTasks = await getTasks();
        setStreaks(allTasks);
      };
  
      fetchStreaks();
  
      // Optionally: return a cleanup function if needed
      return () => {};
    }, []) 
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // tweak offset as needed
          >

    <View style={{ padding: 20 }}>
      {streaks.length === 0 ? (
  <Text>No streaks to show</Text>
) : (streaks.map((task) => (
        <Text key={task.name}>
          {task.name}: 🔥 {task.streak} day{task.streak !== 1 ? 's' : ''}
        </Text>)
      ))}
    </View>

          
          {/* <View style={styles.card}>
              <Text>streaks</Text>
          </View>

          <View style={styles.card}>
              <Text>penis</Text>
          </View>  */}


      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
})

export default Streaks;