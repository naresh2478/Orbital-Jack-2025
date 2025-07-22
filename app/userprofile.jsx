import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth, db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; 
import { useRouter } from 'expo-router';
//import { MOUNTAINS } from '../../utils/constants';

const router = useRouter(); 

const UserProfile = () => {
  const [email, setEmail] = useState('');
  const [totalElevation, setTotalElevation] = useState(0);
  const [conqueredMountains, setConqueredMountains] = useState([]);
  const [currentMountain, setCurrentMountain] = useState('None');

  useFocusEffect(
    React.useCallback(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      const currentEmail = auth.currentUser?.email;
      if (!uid) return;

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setEmail(currentEmail || '');
        setTotalElevation(data.totalElevation || 0);
        setConqueredMountains(data.conqueredMountains || []);
        setCurrentMountain(data.currentMountain || 'None');
      }
    };

    fetchUserData();
  }, []));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text>Email: {email}</Text>
      <Text>Total Elevation: {totalElevation}m</Text>
      <Text>Mountains Conquered: {conqueredMountains.join(', ') || 'None'}</Text>
      <Text>Current Mountain: {currentMountain}</Text>
      <Button title="Friends" onPress={() => router.push('/socialscreen')} /> 
      <Button title="Go Back" onPress={() => router.push('/Homepage/maindb')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default UserProfile;
