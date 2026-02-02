import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/screens/FeedbackScreen.styles';

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

