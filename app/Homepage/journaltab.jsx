import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
      <View style={s.root}>
        <LinearGradient colors={['#92400e', '#78350f', '#451a03']} style={s.headerGrad}>
          <SafeAreaView edges={['top']} style={s.headerInner}>
            <Text style={s.headerIcon}>📖</Text>
            <Text style={s.headerTitle}>My Journal</Text>
            <Text style={s.headerDate}>{today}</Text>
          </SafeAreaView>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Book page */}
            <View style={s.bookPage}>
              <View style={s.bookSpine} />
              <View style={s.pageContent}>
                {/* Lined paper effect */}
                {Array.from({ length: 14 }, (_, i) => (
                  <View key={i} style={[s.line, { top: 52 + i * 28 }]} />
                ))}

                <Text style={s.dateStamp}>{format(new Date(), 'MMM d, yyyy')}</Text>

                <TextInput
                  style={s.textInput}
                  multiline
                  placeholder="Dear journal..."
                  placeholderTextColor="#C4A882"
                  value={text}
                  onChangeText={setText}
                />

                <View style={s.counterRow}>
                  <Text style={[s.counter, wordCount > MAX_WORDS && { color: '#DC2626' }]}>
                    {wordCount}/{MAX_WORDS} words
                  </Text>
                </View>
              </View>
            </View>

            {/* Save button */}
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
              <LinearGradient colors={['#92400e', '#78350f']} style={s.saveBtn}>
                <Text style={s.saveBtnText}>✍️  Save Entry</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* View past entries */}
            <TouchableOpacity
              style={s.viewBtn}
              onPress={() => router.push('../journalentries')}
            >
              <Text style={s.viewBtnText}>📚  View Past Entries</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default JournalTab;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDF6EC' },

  headerGrad: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: { alignItems: 'center', paddingTop: 8 },
  headerIcon: { fontSize: 32 },
  headerTitle: {
    fontSize: 24, fontWeight: '800', color: '#FFD700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 4,
  },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  scroll: { padding: 20, paddingBottom: 40 },

  bookPage: {
    backgroundColor: '#FFF9F0',
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#78350f',
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8D5B8',
  },
  bookSpine: {
    width: 6,
    backgroundColor: '#92400e',
  },
  pageContent: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
    minHeight: 420,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(196,168,130,0.25)',
  },
  dateStamp: {
    fontSize: 12,
    color: '#A0845C',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: '#4A3728',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlignVertical: 'top',
    minHeight: 340,
    paddingTop: 0,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  counter: {
    fontSize: 12,
    color: '#A0845C',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  viewBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(146,64,14,0.08)',
    borderWidth: 1.5,
    borderColor: '#C4A882',
  },
  viewBtnText: {
    color: '#78350f',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
