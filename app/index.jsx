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
  Pressable
} from 'react-native';

import { useRouter } from 'expo-router';

import { Text, TextInput } from 'react-native-paper';

export default function AuthScreen() {
  const router = useRouter();
  return (
    <KeyboardAvoidingView
      behaviour={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View>
          <Text>
            Create Account
          </Text>

          <TextInput 
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            />

          <Pressable
            onPress={() => {
              // Handle sign up logic here
              // For now, just navigate to the main screen
              router.push('/Homepage/main');
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
              <Text>
                To Home
                </Text> 
            </Pressable>

        </View>
      </KeyboardAvoidingView>
  );
}