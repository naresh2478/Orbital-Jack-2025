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

const screenWidth = Dimensions.get('window').width;

// Reference avatar positions for a 100m mountain
const positions = {
  0: { top: 600, left: 30 },
  10: { top: 567, left: 52 },
  20: { top: 519, left: 77 },
  30: { top: 472, left: 102 },
  40: { top: 423, left: 125 },
  50: { top: 352, left: 162 },
  60: { top: 304, left: 185 },
  70: { top: 278, left: 197 },
  80: { top: 231, left: 222 },
  90: { top: 161, left: 257 },
  100: { top: 65, left: 354 },
};

const mountainImages = {
  'Summer Hill': SummerHill,
  'Fall Peak': FallPeak,
  'Sakura Season': SakuraSeason,
  'Nightfall Peak': NightfallPeak,
  'Ski Mountain': SkiMountain,
};

// Local custom hook for fetching elevation
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
          if (err.code === 'permission-denied') {
            setError('Login expired - please sign in again');
          } else {
            setError('Failed to load elevation');
          }
          setElevation(0);
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
  const { elevation, currentMountain, loading, error } = useElevation();

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'PixelFont': require('../../assets/PressStart2P-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFont();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 14 }}>Loading fonts...</Text>
      </View>
    );
  }

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;

  const currentMountainObj = MOUNTAINS.find(m => m.name === currentMountain);
  const peakHeight = currentMountainObj ? currentMountainObj.peak : 100;
  const backgroundImage = mountainImages[currentMountain];

  // ✅ Interpolate avatar position dynamically
  const basePeak = 100; // reference peak height
  const baseStep = 10;

  const currentElevation = Math.min(elevation, peakHeight);
  const normalizedElevation = (currentElevation / peakHeight) * basePeak;

  const lower = Math.floor(normalizedElevation / baseStep) * baseStep;
  const upper = Math.min(lower + baseStep, basePeak);

  const lowerPos = positions[lower] || positions[0];
  const upperPos = positions[upper] || lowerPos;

  const ratio = (normalizedElevation - lower) / baseStep;
  const interpolatedTop = lowerPos.top + (upperPos.top - lowerPos.top) * ratio;
  const interpolatedLeft = lowerPos.left + (upperPos.left - lowerPos.left) * ratio;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="contain">
        <Text style={styles.title}>{currentMountain}</Text>
        <Text style={styles.title}>{peakHeight}m</Text>

        <View style={[styles.avatarContainer, { top: interpolatedTop, left: interpolatedLeft }]}>
          <Text
            style={{
              fontFamily: 'PixelFont',
              fontSize: 12,
              color: backgroundImage === FallPeak ? 'black' : '#FFD700',
            }}
          >
            {elevation}m
          </Text>
          <Image source={avatar} style={[styles.avatar]} />
        </View>

        <Text style={styles.subtitle}>Complete tasks to climb the mountain!</Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Elevation;

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
  },

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
  fontFamily: 'PixelFont',
  fontSize: 15,
  fontWeight: 'bold',
  color: '#FFD700',
  top: '40',

  paddingVertical: 6,
  paddingHorizontal: 8,
  backgroundColor: 'rgba(0, 0, 0, 1)', // semi-transparent black background
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
    marginTop: 10,
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
