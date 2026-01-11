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
import RecipePreviewModal from '../components/RecipePreviewModal';

const GetLatestDealsScreen = ({ navigation }) => {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('e.g., M5V 2H1');
  const [modalVisible, setModalVisible] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !showIntro,
      tabBarStyle: showIntro ? { display: 'none' } : undefined,
    });
  }, [navigation, showIntro]);


  const validatePostalCode = (code) => {
    // Allow spaces or dashes in the middle
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
      Alert.alert(
        'Invalid Postal Code',
        'Please enter a valid Canadian postal code (e.g., M5V 2H1)'
      );
      return;
    }


    setLoading(true);
    try {
      const response = await generateRecipes(formattedPostalCode);

      if (response.success && response.recipes && response.recipes.length > 0) {
        setGeneratedRecipes(response.recipes);
        setModalVisible(true);
        setPostalCode('');
      } else {
        Alert.alert(
          'Error',
          'Failed to generate recipes. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error ||
          'Failed to generate recipes. Please try again.'
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
      {showIntro && (
        <View style={styles.introOverlay}>
          <Text style={styles.introTitle}>Recipe Radar</Text>
          <Text style={styles.introSubtitle}>
            Discover recipes using grocery deals near you
          </Text>

          <TouchableOpacity
            style={styles.introButton}
            onPress={() => setShowIntro(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.introButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}

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
              <MaterialCommunityIcons
                name="chef-hat"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Generate Recipes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="newspaper-variant-multiple"
              size={20}
              color="#F4964A"
            />
            <Text style={styles.infoText}>
              Find grocery flyers in your area
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="robot"
              size={20}
              color="#F4964A"
            />
            <Text style={styles.infoText}>
              AI generates 5 delicious recipes using sale items
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="checkbox-marked"
              size={20}
              color="#F4964A"
            />
            <Text style={styles.infoText}>
              Select recipes and create your shopping list
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="cash"
              size={20}
              color="#F4964A"
            />
            <Text style={styles.infoText}>
              Save money while eating great food!
            </Text>
          </View>
        </View>
      </View>

      <RecipePreviewModal
        visible={modalVisible}
        recipes={generatedRecipes}
        onClose={() => setModalVisible(false)}
        onSaveSuccess={() => {
          console.log('saved');
          setModalVisible(false); // close popup after save
          navigation.navigate('Recipes');
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b33951',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: '#F4964A',
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
    color: '#b33951',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F5DCC7',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },

  button: {
    backgroundColor: '#F4964A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buttonDisabled: {
    backgroundColor: '#E98883',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#F4964A',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b33951',
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
    color: '#b33951',
    marginLeft: 10,
    flexShrink: 1,
  },

  introOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4964A',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  introTitle: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },

  introSubtitle: {
    fontSize: 30,
    color: '#F5DCC7',
    textAlign: 'center',
    marginBottom: 40,
  },

  introButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  introButtonText: {
    color: '#F4964A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetLatestDealsScreen;
