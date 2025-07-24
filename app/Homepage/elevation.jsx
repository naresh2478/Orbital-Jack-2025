import React, { useState, useCallback, useEffect } from 'react';
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

import SummerHill from '../../assets/mountain1.png';
import FallPeak from '../../assets/mountain2.png';
import SakuraSeason from '../../assets/mountain3.png';
import NightfallPeak from '../../assets/mountain4.png';
import SkiMountain from '../../assets/mountain5.png';

import * as Font from 'expo-font';


import avatar from '../../assets/AvatarClimber.png';
import { MOUNTAINS } from '../../utils/constants';  
import { fromUnixTime } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

const MAX_ELEVATION = 100;

// Avatar positions mapped per 10m interval
const positions = {
  0:   { top: 613, left: 6 },
  10:  { top: 577, left: 42 },
  20:  { top: 527, left: 62 },
  30:  { top: 477, left: 82 },
  40:  { top: 434, left: 111 },
  50:  { top: 362, left: 142 }, // ✅ shifted to your red circle
  60:  { top: 310, left: 170 },
  70:  { top: 288, left: 183 },
  80:  { top: 240, left: 207 },
  90:  { top: 170, left: 242 },
  100: { top: 100, left: 310 },
};

//map mountain names to png names
const mountainImages = {
  'Summer Hill': SummerHill,
  'Fall Peak': FallPeak,
  'Sakura Season': SakuraSeason,
  'Nightfall Peak': NightfallPeak,
  'Ski Mountain': SkiMountain,
};

//for loading custom fonts
// const fetchFonts = () => {
//   return Font.loadAsync({
//     'PixelFont': require('../../assets/PressStart2P-Regular.ttf'),
//   });
// };


// ✅ Local custom hook inside the same file
const useElevation = () => {
  
  const [elevation, setElevation] = useState(null);
  const [currentMountain, setCurrentMountain] = useState(''); 
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
            setCurrentMountain(data.currentMountain || 'Unknown Mountain');
          } else {
            setElevation(0);
            setCurrentMountain('Unknown Mountain');
            console.log('No user document found');
          }
        } catch (err) {
              // Enhanced error handling
              if (err.code === 'permission-denied') {
                setError('Login expired - please sign in again');
                router.push('/auth'); // Redirect if needed
              } else {
                setError('Failed to load elevation');
              }
              setElevation(0); // Reset on any error
              console.error('Fetch elevation error:', err);
            } finally {
          setLoading(false);
        }
      };

      fetchElevation();
    }, [])
  );

  return { elevation, currentMountain, loading, error };
};

const Elevation = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'PixelFont': require('../../assets/PressStart2P-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFont();
  }, []);
  
  const { elevation, currentMountain, loading, error } = useElevation();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 14 }}>Loading fonts...</Text>
      </View>
    );
  }

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;

  const current = Math.min(Math.floor(elevation / 10) * 10, 100);
  const { top, left } = positions[current] || positions[0];

  const currentMountainObj = MOUNTAINS.find(m => m.name === currentMountain);
  const peakHeight = currentMountainObj ? currentMountainObj.peak : 100;

  const backgroundImage = mountainImages[currentMountain]; 

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="contain"
      >
        <Text style={styles.title}>{currentMountain}</Text>
        <Text style={styles.elevationText}>{elevation}m / {peakHeight}m</Text>
        <Text
              style={{
                fontFamily: 'PixelFont',
                fontSize: 12,
                color: backgroundImage === FallPeak ? 'black' : '#FFD700',
              }}>
                Hello
              </Text>
        <Image source={avatar} style={[styles.avatar, { top, left }]} />
        <Text style={styles.subtitle}>Complete tasks to climb the mountain!</Text>
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
    width: '100%',
    height: '120%',
    position: 'relative', // Allow movement
    top: -65,
    transform: [{ scale: 1.05 }],
  },
  title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
  top: '40',

  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black background
  borderRadius: 8,
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
    position: 'absolute',
    bottom: -60, // or 20–40 depending on spacing
    alignSelf: 'center',
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
