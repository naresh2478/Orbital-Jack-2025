import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, TouchableWithoutFeedback,
  Keyboard, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addJournalEntry } from '../../utils/journalstorage';
import { format } from 'date-fns';

const MAX_WORDS = 100;

const JournalTab = () => {
  const [text, setText] = useState('');
  const router = useRouter();
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const handleSave = async () => {
    if (wordCount > MAX_WORDS) {
      Alert.alert('Limit Exceeded', `Please limit your journal to ${MAX_WORDS} words.`);
      return;
    }
    if (wordCount === 0) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }
    await addJournalEntry(text);
    Alert.alert('Saved', 'Your journal entry has been saved.');
    setText('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-[#0B1121]">
        {/* Header */}
        <LinearGradient
          colors={['#78350f', '#92400e', '#b45309']}
          style={{ paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <SafeAreaView edges={['top']}>
            <View className="items-center pt-2">
              <Text className="text-4xl">📖</Text>
              <Text className="text-[26px] font-extrabold text-amber-300 mt-1 tracking-tight">
                My Journal
              </Text>
              <Text className="text-[13px] text-white/40 mt-1.5">{today}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Writing Card */}
            <View className="bg-[#141D2B] rounded-2xl overflow-hidden border border-amber-900/20 mb-5">
              {/* Card header */}
              <View className="flex-row items-center px-4 pt-4 pb-2">
                <MaterialCommunityIcons name="pencil-outline" size={16} color="#D97706" />
                <Text className="text-xs text-amber-600 font-semibold ml-1.5 uppercase tracking-widest">
                  New Entry
                </Text>
                <View className="flex-1" />
                <Text className="text-xs text-slate-500 italic">
                  {format(new Date(), 'MMM d, yyyy')}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-white/[0.04] mx-4" />

              {/* Text Input */}
              <TextInput
                className="text-[17px] text-slate-200 px-4 pt-3 pb-2"
                style={{
                  minHeight: 280,
                  lineHeight: 28,
                  textAlignVertical: 'top',
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                }}
                multiline
                placeholder="What's on your mind today..."
                placeholderTextColor="#334155"
                value={text}
                onChangeText={setText}
              />

              {/* Word count */}
              <View className="flex-row justify-end px-4 pb-3">
                <Text
                  className={`text-xs font-medium ${wordCount > MAX_WORDS ? 'text-red-400' : 'text-slate-600'}`}
                >
                  {wordCount}/{MAX_WORDS} words
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} className="overflow-hidden rounded-2xl mb-3">
              <LinearGradient
                colors={['#92400e', '#b45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 16 }}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="content-save-outline" size={18} color="#FDE68A" />
                  <Text className="text-amber-200 text-base font-bold ml-2">Save Entry</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* View Past Entries */}
            <TouchableOpacity
              className="py-4 rounded-2xl items-center bg-amber-900/10 border border-amber-800/20"
              onPress={() => router.push('../journalentries')}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="book-open-variant" size={18} color="#D97706" />
                <Text className="text-amber-600 text-[15px] font-semibold ml-2">
                  View Past Entries
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default JournalTab;
