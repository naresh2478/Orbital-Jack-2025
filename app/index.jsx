import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Logo from '../assets/ElevateYouLogo.png';
import { useRouter } from 'expo-router';
import { Text, TextInput, Button } from 'react-native-paper';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.replace('/Homepage/home');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const [isSignUp, setIsSignUp] = useState(true);
  const handleSwitchMode = () => setIsSignUp(!isSignUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = auth.currentUser.uid;
      await setDoc(doc(db, 'users', uid), {
        email: email,
        createdAt: new Date(),
        elevation: 0,
      }, { merge: true });

      Alert.alert('Signup Successful');
      router.push('/Homepage/home');
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful');
      router.push('/Homepage/home');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inner}>
          <Image source={Logo} style={styles.logo} />

          <Text style={styles.title}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            mode="outlined"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={true}
            mode="outlined"
            style={{ marginBottom: 10 }}
          />

          <Button
            mode="contained"
            onPress={isSignUp ? handleSignUp : handleLogin}
            style={{ backgroundColor: '#3B82F6', marginTop: 10, marginBottom: 10 }}
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>

          <Button
            mode="text"
            labelStyle={{ color: '#000000' }}
            onPress={handleSwitchMode}
          >
            {isSignUp
              ? "Already have an account? Log in here"
              : "Don't have an account? Sign up here"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});
