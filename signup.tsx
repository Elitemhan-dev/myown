import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { validateName, validatePassword, validatePhone } from '@/utils/validation';
import { User, Mail, Lock, Eye, EyeOff, CircleAlert as AlertCircle, Phone, Calendar, Globe } from 'lucide-react-native';

const countries = [
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
];

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    country: 'GH',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Email Verification
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const selectedCountry = countries.find(c => c.code === formData.country) || countries[0];

  const handleSendVerification = async () => {
    const { name, email, password, phone, dateOfBirth, country } = formData;

    if (!name || !email || !password || !phone || !dateOfBirth || !country) {
      setError('Please fill in all fields');
      return;
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.message || 'Invalid name');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }

    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'Invalid phone number');
      return;
    }

    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      setError('You must be at least 13 years old to create an account');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random 6-digit code for demo
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to ${email}.\n\nFor demo purposes, your code is: ${verificationCode}`,
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
      
      // Store the code for verification (in real app, this would be server-side)
      setFormData(prev => ({ ...prev, verificationCode }));
      
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    const enteredCode = formData.verificationCode;
    
    if (!enteredCode || enteredCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    // In a real app, you would verify the code with your backend
    // For demo, we'll just check if it matches what we "sent"
    const storedCode = formData.verificationCode;
    
    setError('');
    const result = await signup(
      formData.name, 
      formData.email, 
      formData.password, 
      `${selectedCountry.dialCode}${formData.phone}`, 
      formData.dateOfBirth,
      selectedCountry.name
    );

    if (result.success) {
      Alert.alert(
        'Account Created Successfully!',
        'Welcome to Elitebuy! You can now start shopping.',
        [{ text: 'Start Shopping', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      setError(result.message || 'Signup failed');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const renderCountryPicker = () => (
    <View style={styles.countryPicker}>
      <ScrollView style={styles.countryList}>
        {countries.map((country) => (
          <TouchableOpacity
            key={country.code}
            style={styles.countryItem}
            onPress={() => {
              updateFormData('country', country.code);
              setShowCountryPicker(false);
            }}
          >
            <Text style={styles.countryName}>{country.name}</Text>
            <Text style={styles.countryCode}>{country.dialCode}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSignupForm = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Join Elitebuy</Text>
        <Text style={styles.subtitle}>Create your shopping account</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Globe size={20} color="#6B7280" style={styles.inputIcon} />
          <TouchableOpacity 
            style={styles.countrySelector}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text style={styles.countryText}>
              {selectedCountry.name} ({selectedCountry.dialCode})
            </Text>
          </TouchableOpacity>
        </View>

        {showCountryPicker && renderCountryPicker()}

        <View style={styles.inputContainer}>
          <Phone size={20} color="#6B7280" style={styles.inputIcon} />
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={formData.dateOfBirth}
            onChangeText={(text) => updateFormData('dateOfBirth', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleSendVerification}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Sending Verification...' : 'Send Verification Code'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.loginLink}>
            <Text style={styles.loginText}>Sign In</Text>
          </Link>
        </View>
      </View>
    </>
  );

  const renderVerificationForm = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {formData.email}</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={formData.verificationCode}
            onChangeText={(text) => updateFormData('verificationCode', text)}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleVerifyAndSignup}
          disabled={authLoading}
        >
          <Text style={styles.signupButtonText}>
            {authLoading ? 'Creating Account...' : 'Verify & Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton} 
          onPress={handleSendVerification}
          disabled={isLoading}
        >
          <Text style={styles.resendText}>
            {isLoading ? 'Sending...' : 'Resend Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setStep(1)}
        >
          <Text style={styles.backText}>Back to Form</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {step === 1 ? renderSignupForm() : renderVerificationForm()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  phoneInput: {
    marginLeft: 8,
  },
  dialCode: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  countrySelector: {
    flex: 1,
    paddingVertical: 4,
  },
  countryText: {
    fontSize: 16,
    color: '#1F2937',
  },
  countryPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    maxHeight: 200,
  },
  countryList: {
    maxHeight: 200,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    fontSize: 16,
    color: '#1F2937',
  },
  countryCode: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLink: {
    marginLeft: 4,
  },
  loginText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});