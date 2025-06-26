import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable, 
  Alert
} from 'react-native';
import Logo from '../assets/ElevateYouLogo.png';

import { useRouter } from 'expo-router';

import { Text, TextInput, Button } from 'react-native-paper';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase'; // Import your Firebase configuration
import { collection, doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

export default function AuthScreen() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //this is supposed to maintain auth state across app restarts 
  //but idk if it works lol
  //import { onAuthStateChanged } from 'firebase/auth';
  // useEffect(() => { 
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setUser(user);
  //     setLoading(false);
  //     if (user) {
  //       router.push('/main');  // navigate programmatically
  //     } else {
  //       router.push('/index');     // navigate programmatically
  //     }
  //   });
  //   return unsubscribe;
  // }, []);


  const [isSignUp, setIsSignUp] = useState(true); //handle logic for sign up or sign in 

  const handleSwitchMode = () => { //handle UI for sign up or log in
    setIsSignUp(!isSignUp);
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {  //handleSignUp function to create a new user

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = auth.currentUser.uid;

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        email: email,
        createdAt: new Date(),
      });
      console.log('User signed up and document created in Firestore');
      router.push('/Homepage/main'); // Navigate to the main screen after sign up
    

    Alert.alert('Signup Successful');

    } catch (error) {
    Alert.alert('Signup Error', error.message);
    }
  };

  const handleLogin = async () => { //handleLogin function to log in an existing user
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful');
      router.push('/Homepage/main'); // Navigate to the main screen after login
    }
    catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };



  


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      >
        <ScrollView
        contentContainerStyle={styles.content}>

          <Image source={Logo} style={styles.logo} />
        
          <Text 
          style={styles.title}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>

          <TextInput 
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            mode = "outlined"
            />

            <TextInput 
              label="Password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry={true}  // hides password input
              mode="outlined"
              style={{ marginBottom: 10 }} />

            <Button mode = "contained" 
              onPress={isSignUp ? handleSignUp : handleLogin}
              style={{ backgroundColor: '#1cb03b', marginTop: 10, marginBottom: 10 }}> {isSignUp ? "Sign Up" : "Log In"} </Button>

            <Button mode = "text" 
            labelStyle={{ color: '#000000' }}
              onPress={handleSwitchMode}> 
              {isSignUp 
                ? "Already have an account? Log in here" 
                :  "Don't have an account? Sign up here"}
            </Button> 

        

          <Button
            onPress={() => {
              
              // For now, just navigate to the main screen 
               router.push('/Homepage/main_db'); //router push vs replace
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#ddd' : '#6200ee',
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              },
            ]}
            >
              <Text style={{ color: '	#000000', fontWeight: 'bold'  }}>
                To Home (For Testing)
              </Text>
                
            </Button>

        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',

  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  } ,
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  }, logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    resizeMode: 'contain',
    marginLeft: 116,
  },
});