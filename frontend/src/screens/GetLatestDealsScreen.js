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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateRecipes } from '../services/api';

const GetLatestDealsScreen = ({ navigation }) => {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('e.g., M5V 2H1');

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
            placeholder={placeholder}
            value={postalCode}
            onChangeText={setPostalCode}
            onFocus={() => setPlaceholder('')}
            onBlur={() => {
              if (!postalCode.trim()) setPlaceholder('e.g., M5V 2H1');
            }}
            autoCapitalize="characters"
            maxLength={7}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateRecipes}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="chef-hat" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Generate Recipes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="newspaper-variant-multiple" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Find grocery flyers in your area</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="robot" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>AI generates 5 delicious recipes using sale items</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="checkbox-marked" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Select recipes and create your shopping list</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Save money while eating great food!</Text>
          </View>
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
    marginTop: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#1B5E20',
    marginLeft: 10,
    flexShrink: 1,
  },
});

export default GetLatestDealsScreen;
