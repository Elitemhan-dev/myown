import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/database/database';
import { validateName, validatePassword } from '@/utils/validation';
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, Bell, Globe, Moon } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // App settings
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'English'
  });

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    if (!user) return;

    try {
      const userDetails = await database.getUserById(parseInt(user.id));
      if (userDetails) {
        setProfileForm({
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone || '',
          address: userDetails.address || '',
          city: userDetails.city || '',
          state: userDetails.state || '',
          zipCode: userDetails.zip_code || ''
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate name
    const nameValidation = validateName(profileForm.name);
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.message);
      return;
    }

    setLoading(true);

    try {
      const success = await database.updateUserProfile(parseInt(user.id), {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        zip_code: profileForm.zipCode
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    // Verify current password
    const isValidUser = await database.validateUser(user.email, passwordForm.currentPassword);
    if (!isValidUser) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    Alert.alert(
      'Change Password',
      'Are you sure you want to change your password?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await database.updatePassword(parseInt(user.id), passwordForm.newPassword);
              if (success) {
                Alert.alert('Success', 'Password changed successfully');
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              } else {
                Alert.alert('Error', 'Failed to change password');
              }
            } catch (error) {
              console.error('Error changing password:', error);
              Alert.alert('Error', 'An error occurred while changing password');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleSetting = (setting: string, value: boolean) => {
    setAppSettings(prev => ({ ...prev, [setting]: value }));
    Alert.alert('Setting Updated', `${setting} has been ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={profileForm.name}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Email"
            value={profileForm.email}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={profileForm.phone}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, phone: text }))}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={profileForm.address}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, address: text }))}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={profileForm.city}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={profileForm.state}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, state: text }))}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ZIP Code"
            value={profileForm.zipCode}
            onChangeText={(text) => setProfileForm(prev => ({ ...prev, zipCode: text }))}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color="#6B7280" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications about orders and offers</Text>
            </View>
          </View>
          <Switch
            value={appSettings.notifications}
            onValueChange={(value) => handleToggleSetting('notifications', value)}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={appSettings.notifications ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Moon size={20} color="#6B7280" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Switch to dark theme</Text>
            </View>
          </View>
          <Switch
            value={appSettings.darkMode}
            onValueChange={(value) => handleToggleSetting('darkMode', value)}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={appSettings.darkMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Globe size={20} color="#6B7280" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>Choose your preferred language</Text>
            </View>
          </View>
          <Text style={styles.settingValue}>{appSettings.language}</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        
        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
            secureTextEntry={!showCurrentPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity 
          style={styles.changePasswordButton} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.changePasswordButtonText}>
            {loading ? 'Changing...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  disabledInput: {
    color: '#9CA3AF',
  },
  eyeIcon: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  changePasswordButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});