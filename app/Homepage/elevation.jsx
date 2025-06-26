// elevation.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { SafeAreaView, ScrollView } from 'react-native-safe-area-context';
import { getTasks } from '../../utils/streakstoragedb'; 

import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

export const useElevation = () => {
  const [elevation, setElevation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useFocusEffect(
    useCallback(() => {
      const fetchElevation = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setElevation(data.elevation ?? 0);
          } else {
            setElevation(0);
            console.log('No user document found');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchElevation();

    
    }, []) // empty deps: runs every time the screen is focused
  );

  return { elevation, loading, error };
};


const Elevation = () => {
     const { elevation, loading, error } = useElevation();
  

  

  return (
    <View style={styles.container}>
        <Text> {elevation}</Text>
    </View>
  );
};

export default Elevation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  count: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  note: {
    fontSize: 16,
    color: '#555',
  },
});