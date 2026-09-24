import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';
import * as Font from 'expo-font';
import avatarImg from '../../assets/AvatarClimber.png';
import { MOUNTAINS } from '../../utils/constants';

import SummerHill from '../../assets/mountain1.png';
import FallPeak from '../../assets/mountain2.png';
import SakuraSeason from '../../assets/mountain3.png';
import NightfallPeak from '../../assets/mountain4.png';
import SkiMountain from '../../assets/mountain5.png';

const { width: SW, height: SH } = Dimensions.get('window');

const MOUNTAIN_IMAGES = {
  'Summer Hill': SummerHill,
  'Fall Peak': FallPeak,
  'Sakura Season': SakuraSeason,
  'Nightfall Peak': NightfallPeak,
  'Ski Mountain': SkiMountain,
};

function getSkyColors() {
  const h = new Date().getHours();
  if (h >= 5 && h < 7)   return ['#FF6B6B', '#FF8E53', '#FFC371', '#87CEEB'];
  if (h >= 7 && h < 17)  return ['#1e3c72', '#2a5298', '#6BB5E8', '#A8D8EA'];
  if (h >= 17 && h < 20) return ['#e65c00', '#F9A825', '#FF8A5C', '#FFC371'];
  return ['#0a0e27', '#141852', '#2b2d78'];
}

function getPathPosition(progress) {
  const t = Math.min(Math.max(progress, 0), 1);
  const sx = 0.06, sy = 0.70;
  const cx = 0.28, cy = 0.32;
  const ex = 0.85, ey = 0.05;
  const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
  const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;
  return { x: x * SW, y: y * SH };
}

function FloatingCloud({ delay, duration, y, scale: s, opacity: op }) {
  const tx = useRef(new Animated.Value(-180)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-180);
      Animated.timing(tx, {
        toValue: SW + 100,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(run);
    };
    run();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      top: y,
      transform: [{ translateX: tx }, { scale: s }],
      flexDirection: 'row',
      alignItems: 'flex-end',
      opacity: op,
    }}>
      <View style={[st.cloudBlob, { width: 60, height: 35, borderRadius: 18 }]} />
      <View style={[st.cloudBlob, { width: 85, height: 55, borderRadius: 28, marginLeft: -15, marginBottom: 5 }]} />
      <View style={[st.cloudBlob, { width: 55, height: 32, borderRadius: 16, marginLeft: -12 }]} />
    </Animated.View>
  );
}

function BackgroundRidge({ color, bottom, hills }) {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom, height: 400 }}>
      {hills.map((h, i) => (
        <View key={i} style={{
          position: 'absolute',
          bottom: 0,
          left: h.x,
          width: h.w,
          height: h.h,
          borderTopLeftRadius: h.w * 0.45,
          borderTopRightRadius: h.w * 0.4,
          backgroundColor: color,
        }} />
      ))}
    </View>
  );
}

function TrailDots({ progress }) {
  const dots = [];
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const pos = getPathPosition(t);
    const reached = t <= progress;
    dots.push(
      <View key={i} style={{
        position: 'absolute',
        left: pos.x - 3,
        top: pos.y + 30,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: reached ? 'rgba(255,215,0,0.8)' : 'rgba(255,255,255,0.25)',
      }} />
    );
  }
  return <>{dots}</>;
}

function Stars() {
  const h = new Date().getHours();
  if (h >= 6 && h < 19) return null;
  const positions = [
    [0.1, 0.05], [0.3, 0.08], [0.7, 0.03], [0.9, 0.1],
    [0.15, 0.15], [0.5, 0.12], [0.85, 0.06], [0.4, 0.02],
    [0.6, 0.18], [0.25, 0.22], [0.75, 0.15], [0.95, 0.2],
    [0.05, 0.25], [0.55, 0.08], [0.35, 0.18],
  ];
  return (
    <>
      {positions.map((p, i) => {
        const size = (i % 3 === 0) ? 3 : 2;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: p[0] * SW,
            top: p[1] * SH,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
          }} />
        );
      })}
    </>
  );
}

const useElevation = () => {
  const [elevation, setElevation] = useState(null);
  const [currentMountain, setCurrentMountain] = useState('');
  const [totalElevation, setTotalElevation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) { setError('User not logged in'); setLoading(false); return; }
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            const d = snap.data();
            setElevation(d.elevation ?? 0);
            setCurrentMountain(d.currentMountain || 'Unknown Mountain');
            setTotalElevation(d.totalElevation ?? 0);
          } else {
            setElevation(0);
            setCurrentMountain('Unknown Mountain');
          }
        } catch (err) {
          setError(err.code === 'permission-denied' ? 'Login expired' : 'Failed to load');
          setElevation(0);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  return { elevation, currentMountain, totalElevation, loading, error };
};

export default function Elevation() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { elevation, currentMountain, totalElevation, loading, error } = useElevation();

  const avatarY = useRef(new Animated.Value(SH * 0.70)).current;
  const avatarX = useRef(new Animated.Value(SW * 0.06)).current;

  useEffect(() => {
    Font.loadAsync({ 'PixelFont': require('../../assets/PressStart2P-Regular.ttf') })
      .then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    if (elevation === null) return;
    const peak = MOUNTAINS.find(m => m.name === currentMountain)?.peak ?? 100;
    const progress = Math.min(elevation / peak, 1);
    const pos = getPathPosition(progress);
    Animated.parallel([
      Animated.spring(avatarY, { toValue: pos.y, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(avatarX, { toValue: pos.x, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [elevation, currentMountain]);

  if (!fontsLoaded || loading) {
    return (
      <View style={st.center}>
        <Text style={{ fontSize: 14, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={st.center}>
        <Text style={{ fontSize: 14, color: 'red' }}>{error}</Text>
      </View>
    );
  }

  const peak = MOUNTAINS.find(m => m.name === currentMountain)?.peak ?? 100;
  const bgImage = MOUNTAIN_IMAGES[currentMountain];
  const progress = Math.min((elevation ?? 0) / peak, 1);
  const isDark = new Date().getHours() >= 19 || new Date().getHours() < 6;

  return (
    <View style={st.container}>
      <LinearGradient colors={getSkyColors()} style={StyleSheet.absoluteFill} />

      <Stars />

      <BackgroundRidge
        color={isDark ? 'rgba(10,20,15,0.35)' : 'rgba(45,85,55,0.22)'}
        bottom={180}
        hills={[
          { x: -100, w: 420, h: 280 },
          { x: 200, w: 450, h: 300 },
          { x: SW - 120, w: 340, h: 240 },
        ]}
      />
      <BackgroundRidge
        color={isDark ? 'rgba(8,18,12,0.45)' : 'rgba(35,70,45,0.30)'}
        bottom={110}
        hills={[
          { x: -50, w: 340, h: 230 },
          { x: 160, w: 380, h: 260 },
          { x: SW - 70, w: 280, h: 210 },
        ]}
      />
      <BackgroundRidge
        color={isDark ? 'rgba(5,15,10,0.5)' : 'rgba(25,55,35,0.35)'}
        bottom={50}
        hills={[
          { x: -30, w: 280, h: 180 },
          { x: 130, w: 320, h: 200 },
          { x: SW - 60, w: 240, h: 170 },
        ]}
      />

      <View style={st.mountainWrap}>
        <Image source={bgImage} style={st.mountainImg} resizeMode="contain" />
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.25)']}
        style={st.fogLayer}
      />

      <FloatingCloud delay={0}     duration={26000} y={SH * 0.05} scale={1.1} opacity={0.75} />
      <FloatingCloud delay={8000}  duration={34000} y={SH * 0.14} scale={0.8} opacity={0.55} />
      <FloatingCloud delay={15000} duration={30000} y={SH * 0.03} scale={0.95} opacity={0.65} />

      <TrailDots progress={progress} />

      <Animated.View style={{
        position: 'absolute',
        alignItems: 'center',
        transform: [{ translateX: avatarX }, { translateY: avatarY }],
      }}>
        <View style={st.avatarGlow} />
        <Text style={[st.elevLabel, {
          color: isDark ? '#FFD700' : (bgImage === FallPeak ? '#222' : '#FFD700'),
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }]}>{elevation}m</Text>
        <Image source={avatarImg} style={st.avatar} />
      </Animated.View>

      <SafeAreaView style={st.topBar} edges={['top']}>
        <View style={st.badge}>
          <Text style={st.badgeName}>{currentMountain}</Text>
          <Text style={st.badgePeak}>Peak: {peak}m</Text>
        </View>
      </SafeAreaView>

      <View style={st.bottomBar}>
        <View style={st.progressTrack}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[st.progressFill, { width: `${Math.max(progress * 100, 2)}%` }]}
          />
        </View>
        <View style={st.statsRow}>
          <Text style={st.stat}>{elevation}m / {peak}m</Text>
          <Text style={st.stat}>Lifetime: {totalElevation}m</Text>
        </View>
        <Text style={st.hint}>Complete habits to climb higher!</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#87CEEB' },

  mountainWrap: {
    position: 'absolute',
    top: -65,
    width: '100%',
    height: '120%',
    transform: [{ scale: 1.05 }],
  },
  mountainImg: { width: '100%', height: '100%' },

  fogLayer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 80,
  },

  cloudBlob: { backgroundColor: 'rgba(255,255,255,0.92)' },

  avatarGlow: {
    position: 'absolute',
    bottom: -5,
    width: 50,
    height: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,215,0,0.25)',
  },
  avatar: { width: 70, height: 70, marginTop: 4 },
  elevLabel: { fontFamily: 'PixelFont', fontSize: 11 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    alignItems: 'center', paddingTop: 8,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  badgeName: { fontFamily: 'PixelFont', fontSize: 13, color: '#FFD700' },
  badgePeak: { fontFamily: 'PixelFont', fontSize: 10, color: '#FFD700', marginTop: 4, opacity: 0.8 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
  },
  progressTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  stat: { color: 'white', fontSize: 12, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginTop: 8 },
});
