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
import { useRouter } from 'expo-router';
import { addJournalEntry } from '../../utils/journalstorage';

const MAX_WORDS = 100;

const JournalTab = () => {
  const [text, setText] = useState('');
  const router = useRouter();

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

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
    Alert.alert('Success', 'Your journal entry was saved.');
    setText('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Journal</Text>

        <TextInput
          style={styles.textBox}
          multiline
          placeholder="Add your thoughts..."
          value={text}
          onChangeText={setText}
        />

        <Text style={styles.counter}>{wordCount}/{MAX_WORDS}</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewButton} onPress={() => router.push('../journalentries')}>
          <Text style={styles.viewText}>View Past Journal Entries</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default JournalTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textBox: {
    height: 500,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  counter: {
    textAlign: 'right',
    marginVertical: 5,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewButton: {
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    borderColor: '#007BFF',
    borderWidth: 2,
    alignItems: 'center',
  },
  viewText: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
