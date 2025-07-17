import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database, LoginHistory } from '@/database/database';
import { ArrowLeft, Clock, Monitor, MapPin } from 'lucide-react-native';

export default function LoginHistoryScreen() {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    if (!user) return;

    try {
      const history = await database.getLoginHistory(parseInt(user.id), 20);
      setLoginHistory(history);
    } catch (error) {
      console.error('Error loading login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const renderLoginItem = ({ item, index }: { item: LoginHistory; index: number }) => {
    const { date, time } = formatDateTime(item.login_time);
    const isCurrentSession = index === 0;

    return (
      <View style={[styles.loginItem, isCurrentSession && styles.currentSession]}>
        <View style={styles.loginIcon}>
          <Monitor size={20} color={isCurrentSession ? '#10B981' : '#6B7280'} />
        </View>
        
        <View style={styles.loginInfo}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginDate}>{date}</Text>
            <Text style={styles.loginTime}>{time}</Text>
          </View>
          
          <View style={styles.loginDetails}>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.ip_address || 'Unknown Location'}
              </Text>
            </View>
            <Text style={styles.userAgent} numberOfLines={1}>
              {item.user_agent || 'Mobile App'}
            </Text>
          </View>
          
          {isCurrentSession && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current Session</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Clock size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Login History</Text>
      <Text style={styles.emptySubtitle}>Your login history will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Login History</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Security Information</Text>
        <Text style={styles.infoText}>
          Monitor your account activity. If you notice any suspicious login attempts, 
          please change your password immediately.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading login history...</Text>
        </View>
      ) : loginHistory.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={loginHistory}
          renderItem={renderLoginItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  historyList: {
    padding: 16,
  },
  loginItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentSession: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  loginIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loginInfo: {
    flex: 1,
  },
  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  loginTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  userAgent: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  currentBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});