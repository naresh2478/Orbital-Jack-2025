// elevation.jsx
// import React, { useState, useCallback, useEffect } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { format } from 'date-fns';
// import { SafeAreaView, ScrollView } from 'react-native-safe-area-context';
// import { getTasks } from '../../utils/streakstoragedb'; 

// import { doc, getDoc } from 'firebase/firestore';
// import { db, auth } from '../../utils/firebase';

// export const useElevation = () => {
//   const [elevation, setElevation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

// useFocusEffect(
//     useCallback(() => {
//       const fetchElevation = async () => {
//         const uid = auth.currentUser?.uid;
//         if (!uid) {
//           setError('User not logged in');
//           setLoading(false);
//           return;
//         }

//         try {
//           const userDocRef = doc(db, 'users', uid);
//           const userDocSnap = await getDoc(userDocRef);

//           if (userDocSnap.exists()) {
//             const data = userDocSnap.data();
//             setElevation(data.elevation ?? 0);
//           } else {
//             setElevation(0);
//             console.log('No user document found');
//           }
//         } catch (err) {
//           setError(err.message);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchElevation();

    
//     }, []) // empty deps: runs every time the screen is focused
//   );

//   return { elevation, loading, error };
// };


// const Elevation = () => {
//      const { elevation, loading, error } = useElevation();
  

  

//   return (
//     <View style={styles.container}>
//         <Text> {elevation}</Text>
//     </View>
//   );
// };

// export default Elevation;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F0F4F8',
//   },
//   content: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   count: {
//     fontSize: 40,
//     color: '#4CAF50',
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   note: {
//     fontSize: 16,
//     color: '#555',
//   },
// });


// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   ImageBackground,
//   Dimensions,
//   Text,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { doc, getDoc } from 'firebase/firestore';
// import { db, auth } from '../../utils/firebase';

// // Assets
// import mountain from '../../assets/MountainPicture.png';
// import avatar from '../../assets/AvatarClimber.png';

// // Constants
// const MAX_ELEVATION = 100;
// const { height: screenHeight } = Dimensions.get('window');

// // Hook
// const useElevation = () => {
//   const [elevation, setElevation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useFocusEffect(
//     useCallback(() => {
//       const fetchElevation = async () => {
//         const uid = auth.currentUser?.uid;
//         if (!uid) {
//           setError('User not logged in');
//           setLoading(false);
//           return;
//         }

//         try {
//           const userDoc = await getDoc(doc(db, 'users', uid));
//           if (userDoc.exists()) {
//             const data = userDoc.data();
//             setElevation(data.elevation ?? 0);
//           } else {
//             setElevation(0);
//           }
//         } catch (err) {
//           setError(err.message);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchElevation();
//     }, [])
//   );

//   return { elevation, loading, error };
// };

// // Component
// const Elevation = () => {
//   const { elevation, loading, error } = useElevation();

//   if (loading) return <Text style={styles.statusText}>Loading...</Text>;
//   if (error) return <Text style={styles.statusText}>Error: {error}</Text>;

//   const climbPercent = Math.min(elevation / MAX_ELEVATION, 1);
//   const avatarOffset = screenHeight * (1 - climbPercent) - 100;

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={mountain}
//         style={styles.background}
//         resizeMode="cover"
//       >
//         <Image
//           source={avatar}
//           style={[styles.avatar, { top: avatarOffset }]}
//           resizeMode="contain"
//         />
//         <Text style={styles.elevationText}>Elevation: {elevation}m</Text>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default Elevation;

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   background: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//     justifyContent: 'flex-start',
//   },
//   avatar: {
//     position: 'absolute',
//     alignSelf: 'center',
//     width: 80,
//     height: 80,
//   },
//   elevationText: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: 8,
//     borderRadius: 8,
//     color: 'white',
//     fontSize: 16,
//   },
//   statusText: {
//     marginTop: 50,
//     textAlign: 'center',
//     fontSize: 18,
//     color: '#888',
//   },
// });

// import React, { useState, useCallback } from 'react';
// import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { doc, getDoc } from 'firebase/firestore';
// import { db, auth } from '../../utils/firebase';

// import mountainBg from '../../assets/MountainPicture.png'; // Replace with your actual mountain image
// import avatar from '../../assets/AvatarClimber.png';       // Replace with your avatar image

// const MAX_ELEVATION = 100;

// const useElevation = () => {
//   const [elevation, setElevation] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useFocusEffect(
//     useCallback(() => {
//       const fetchElevation = async () => {
//         const uid = auth.currentUser?.uid;
//         if (!uid) return;

//         try {
//           const userDoc = await getDoc(doc(db, 'users', uid));
//           if (userDoc.exists()) {
//             setElevation(userDoc.data().elevation ?? 0);
//           }
//         } catch (err) {
//           console.error('Error fetching elevation:', err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchElevation();
//     }, [])
//   );

//   return { elevation, loading };
// };

// const Elevation = () => {
//   const { elevation, loading } = useElevation();
//   const screenHeight = Dimensions.get('window').height;
//   const screenWidth = Dimensions.get('window').width;

//   const climbPercent = Math.min(elevation / MAX_ELEVATION, 1);

//   const topOffset = screenHeight * (1 - climbPercent) - 100; // 100 for avatar height buffer
//   const leftOffset = climbPercent * screenWidth - 40;        // 40 for avatar width buffer

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#555" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Image source={mountainBg} style={styles.background} resizeMode="cover" />
//       <Image
//         source={avatar}
//         style={[styles.avatar, { top: topOffset, left: leftOffset }]}
//         resizeMode="contain"
//       />
//       <View style={styles.overlay}>
//         <Text style={styles.title}>🏔 Elevation</Text>
//         <Text style={styles.score}>+{elevation}m</Text>
//         <Text style={styles.tip}>Complete tasks to climb the mountain!</Text>
//       </View>
//     </View>
//   );
// };

// export default Elevation;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   background: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//   },
//   avatar: {
//     position: 'absolute',
//     width: 60,
//     height: 60,
//   },
//   overlay: {
//     position: 'absolute',
//     top: 60,
//     width: '100%',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   score: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFD700',
//     marginTop: 10,
//   },
//   tip: {
//     marginTop: 6,
//     fontSize: 16,
//     color: '#f0f0f0',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

import mountain from '../../assets/MountainPicture.png';
import avatar from '../../assets/AvatarClimber.png';

const screenWidth = Dimensions.get('window').width;

const MAX_ELEVATION = 100;

// Avatar positions mapped per 10m interval
const positions = {
  0:   { top: 480, left: 10 },
  10:  { top: 430, left: 40 },
  20:  { top: 380, left: 70 },
  30:  { top: 330, left: 100 },
  40:  { top: 280, left: 130 },
  50:  { top: 230, left: 160 }, // ✅ shifted to your red circle
  60:  { top: 180, left: 190 },
  70:  { top: 130, left: 220 },
  80:  { top: 80, left: 250 },
  90:  { top: 40, left: 280 },
  100: { top: 10, left: 310 },
};


// ✅ Local custom hook inside the same file
const useElevation = () => {
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
    }, [])
  );

  return { elevation, loading, error };
};

const Elevation = () => {
  const { elevation, loading, error } = useElevation();

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;

  const current = Math.min(Math.floor(elevation / 10) * 10, 100);
  const { top, left } = positions[current] || positions[0];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={mountain}
        style={styles.background}
        resizeMode="contain"
      >
        <Text style={styles.title}>⛰️ Elevation</Text>
        <Text style={styles.elevationText}>+{elevation}m</Text>
        <Text style={styles.subtitle}>Complete tasks to climb the mountain!</Text>

        <Image source={avatar} style={[styles.avatar, { top, left }]} />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Elevation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // sky blue
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    width: screenWidth,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  elevationText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700', // gold
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  avatar: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 18,
  },
  error: {
    marginTop: 100,
    textAlign: 'center',
    color: 'red',
  },
});
