// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { auth, db } from '../../utils/firebase';
// import { doc, getDoc } from 'firebase/firestore';

// const MOUNTAINS = ['Mountain A', 'Mountain B', 'Mountain C'];

// const UserProfile = () => {
//   const [elevation, setElevation] = useState(0);
//   const [conqueredMountains, setConqueredMountains] = useState([]);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const uid = auth.currentUser?.uid;
//       if (!uid) return;

//       const userDocRef = doc(db, 'users', uid);
//       const userSnap = await getDoc(userDocRef);
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         setElevation(data.elevation || 0);
//         setConqueredMountains(data.conqueredMountains || []);
//       }
//     };

//     fetchUserData();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>User Profile</Text>
//       <Text>Current Elevation: {elevation}m</Text>
//       <Text>Mountains Conquered: {conqueredMountains.join(', ') || 'None'}</Text>

//       <View style={styles.mountainsList}>
//         {MOUNTAINS.map((mountain, index) => (
//           <Text key={index} style={styles.mountain}>
//             {conqueredMountains.includes(mountain) ? '🏔️' : '⛰️'} {mountain}
//           </Text>
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20, flex: 1, backgroundColor: '#F5F5F5' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
//   mountainsList: { marginTop: 20 },
//   mountain: { fontSize: 18, marginVertical: 5 },
// });

// export default UserProfile;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; 
//import { MOUNTAINS } from '../../utils/constants';


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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default UserProfile;
