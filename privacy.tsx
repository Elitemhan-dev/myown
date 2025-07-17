import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/database/database';
import { ArrowLeft, Shield, Eye, Bell, Lock, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function PrivacyScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [lastLogin, setLastLogin] = useState<string>('');

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      const userDetails = await database.getUserById(parseInt(user.id));
      if (userDetails) {
        setTwoFactorEnabled(userDetails.two_factor_enabled);
        setLastLogin(userDetails.last_login || '');
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleToggleTwoFactor = async (enabled: boolean) => {
    if (!user) return;

    if (enabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'Two-factor authentication adds an extra layer of security to your account. You will receive a verification code via email when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const success = await database.updateUserProfile(parseInt(user.id), {
                two_factor_enabled: true
              });
              if (success) {
                setTwoFactorEnabled(true);
                Alert.alert('Success', 'Two-factor authentication has been enabled');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const success = await database.updateUserProfile(parseInt(user.id), {
                two_factor_enabled: false
              });
              if (success) {
                setTwoFactorEnabled(false);
                Alert.alert('Success', 'Two-factor authentication has been disabled');
              }
            }
          }
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data including orders, wishlist, and personal information will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    if (user) {
                      const success = await database.deleteUser(parseInt(user.id));
                      if (success) {
                        logout();
                        router.replace('/(auth)/login');
                      } else {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const formatLastLogin = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const privacyItems = [
    {
      icon: Eye,
      title: 'Data Visibility',
      description: 'Control what information is visible to others',
      action: () => Alert.alert('Coming Soon', 'Data visibility settings will be available soon')
    },
    {
      icon: Bell,
      title: 'Notification Preferences',
      description: 'Manage your notification settings',
      action: () => Alert.alert('Coming Soon', 'Notification preferences will be available soon')
    },
    {
      icon: Lock,
      title: 'Login History',
      description: 'View your recent login activity',
      action: () => router.push('/account/login-history')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      {/* Security Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Security Status</Text>
        </View>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Last Login</Text>
          <Text style={styles.statusValue}>{formatLastLogin(lastLogin)}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Account Created</Text>
          <Text style={styles.statusValue}>
            {user ? new Date(user.id).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Two-Factor Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
        <View style={styles.twoFactorCard}>
          <View style={styles.twoFactorInfo}>
            <Text style={styles.twoFactorTitle}>Email Verification</Text>
            <Text style={styles.twoFactorDescription}>
              Receive a verification code via email when logging in
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={handleToggleTwoFactor}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={twoFactorEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        {privacyItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.privacyItem}
            onPress={item.action}
          >
            <View style={styles.privacyIcon}>
              <item.icon size={20} color="#6B7280" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>{item.title}</Text>
              <Text style={styles.privacyDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <View style={styles.dangerHeader}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.dangerTitle}>Danger Zone</Text>
        </View>
        
        <TouchableOpacity style={styles.deleteAccountCard} onPress={handleDeleteAccount}>
          <View style={styles.deleteInfo}>
            <Text style={styles.deleteTitle}>Delete Account</Text>
            <Text style={styles.deleteDescription}>
              Permanently delete your account and all associated data
            </Text>
          </View>
          <Trash2 size={20} color="#EF4444" />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusTitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  twoFactorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  twoFactorInfo: {
    flex: 1,
    marginRight: 16,
  },
  twoFactorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  twoFactorDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerSection: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  deleteAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteInfo: {
    flex: 1,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  deleteDescription: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
});