import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { generateRecipes } from '../services/api';

const GetLatestDealsScreen = ({ navigation }) => {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePostalCode = (code) => {
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalRegex.test(code);
  };

  const handleGenerateRecipes = async () => {
    if (!postalCode.trim()) {
      Alert.alert('Error', 'Please enter a postal code');
      return;
    }

    const formattedPostalCode = postalCode.trim().toUpperCase();
    
    if (!validatePostalCode(formattedPostalCode)) {
      Alert.alert('Invalid Postal Code', 'Please enter a valid Canadian postal code (e.g., M5V 2H1)');
      return;
    }

    setLoading(true);
    try {
      const recipes = await generateRecipes(formattedPostalCode);
      
      Alert.alert(
        'Success!',
        `Generated ${recipes.length} recipes based on local deals in ${formattedPostalCode}`,
        [
          {
            text: 'View Recipes',
            onPress: () => navigation.navigate('Recipes'),
          },
        ]
      );
      
      setPostalCode('');
    } catch (error) {
      console.error('Error generating recipes:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to generate recipes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Find Recipes Based on Local Deals</Text>
        <Text style={styles.subtitle}>
          Enter your postal code to discover recipes using items on sale near you
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., M5V 2H1"
            value={postalCode}
            onChangeText={setPostalCode}
            autoCapitalize="characters"
            maxLength={7}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateRecipes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Recipes</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>1. We'll find grocery flyers in your area</Text>
          <Text style={styles.infoText}>2. AI generates 5 delicious recipes using sale items</Text>
          <Text style={styles.infoText}>3. Select recipes and create your shopping list</Text>
          <Text style={styles.infoText}>4. Save money while eating great food!</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1B5E20',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default GetLatestDealsScreen;
