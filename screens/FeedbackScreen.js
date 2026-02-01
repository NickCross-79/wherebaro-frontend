import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackScreen({ navigation }) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    setMessage('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#D4A574" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FEEDBACK</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Share your thoughts</Text>
        <Text style={styles.subtitle}>
          Tell us what you like, what could be better, or any bugs you found.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Type your feedback here..."
          placeholderTextColor="#5A6B8C"
          multiline
          numberOfLines={6}
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, !message.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!message.trim()}
        >
          <Text style={styles.submitButtonText}>Send Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0F1419',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#151B23',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#9BA5B8',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F1419',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    minHeight: 140,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#D4A574',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#2A3442',
  },
  submitButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
