// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import { auth, db } from '../utils/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { useFocusEffect } from '@react-navigation/native'; 
// import { useRouter } from 'expo-router';
// //import { MOUNTAINS } from '../../utils/constants';

// const router = useRouter(); 

// const UserProfile = () => {
//   const [email, setEmail] = useState('');
//   const [totalElevation, setTotalElevation] = useState(0);
//   const [conqueredMountains, setConqueredMountains] = useState([]);
//   const [currentMountain, setCurrentMountain] = useState('None');

//   useFocusEffect(
//     React.useCallback(() => {
//     const fetchUserData = async () => {
//       const uid = auth.currentUser?.uid;
//       const currentEmail = auth.currentUser?.email;
//       if (!uid) return;

//       const userDocRef = doc(db, 'users', uid);
//       const userSnap = await getDoc(userDocRef);
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         setEmail(currentEmail || '');
//         setTotalElevation(data.totalElevation || 0);
//         setConqueredMountains(data.conqueredMountains || []);
//         setCurrentMountain(data.currentMountain || 'None');
//       }
//     };

//     fetchUserData();
//   }, []));

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>User Profile</Text>
//       <Text>Email: {email}</Text>
//       <Text>Total Elevation: {totalElevation}m</Text>
//       <Text>Mountains Conquered: {conqueredMountains.join(', ') || 'None'}</Text>
//       <Text>Current Mountain: {currentMountain}</Text>
//       <Button title="Friends" onPress={() => router.push('/socialscreen')} /> 
//       <Button title="Go Back" onPress={() => router.push('/Homepage/maindb')} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20, flex: 1, backgroundColor: '#F5F5F5' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
// });

// export default UserProfile;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { auth, db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';


// Icon assets
import emailIcon from '../assets/email.png';
import elevationIcon from '../assets/elevationicon.png';
import conqueredIcon from '../assets/conquer.png';
import currentMountainIcon from '../assets/MountainIcon.png';

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
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/Homepage/maindb')}>
        <Text style={styles.goBack}>⬅ Go Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>User Profile</Text>

      <View style={styles.infoCard}>
        <Image source={emailIcon} style={styles.icon} />
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={elevationIcon} style={styles.icon} />
        <Text style={styles.label}>Total Elevation:</Text>
        <Text style={styles.info}>{totalElevation} m</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={conqueredIcon} style={styles.icon} />
        <Text style={styles.label}>Mountains Conquered:</Text>
        <Text style={styles.info}>
          {conqueredMountains.length > 0 ? conqueredMountains.join(', ') : 'None'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={currentMountainIcon} style={styles.icon} />
        <Text style={styles.label}>Current Mountain:</Text>
        <Text style={styles.info}>{currentMountain}</Text>
      </View>

      <TouchableOpacity style={styles.friendsButton} onPress={() => router.push('/socialscreen')}>
        <Text style={styles.friendsText}>View Friends</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FAFAFA' },
  goBack: { fontSize: 16, color: '#007BFF', marginBottom: 20 },
  //title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  title: {
  fontSize: 32,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 30,
  fontFamily: Platform.select({
    ios: 'AvenirNext-DemiBold',
    android: 'sans-serif-condensed',
  }),
  color: '#222',
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 1, height: 2 },
  textShadowRadius: 3,
},

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { width: 30, height: 30, marginRight: 15 },
  label: { fontWeight: 'bold', fontSize: 16, flex: 1 },
  info: { fontSize: 16, flex: 2 },

  friendsButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  friendsText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default UserProfile;
