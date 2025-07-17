import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/database/database';
import { Package, Users, ShoppingBag, DollarSign, TrendingUp, Eye } from 'lucide-react-native';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    } else {
      router.replace('/(tabs)');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const analytics = await database.getAnalytics();
      setStats(analytics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const dashboardCards = [
    {
      title: 'Total Revenue',
      value: `₵${stats.totalRevenue.toFixed(2)}`,
      growth: stats.revenueGrowth,
      icon: DollarSign,
      color: '#10B981',
      route: '/analytics'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      growth: stats.ordersGrowth,
      icon: ShoppingBag,
      color: '#3B82F6',
      route: '/(admin)/orders'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      growth: stats.usersGrowth,
      icon: Users,
      color: '#8B5CF6',
      route: '/(admin)/users'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      growth: 0,
      icon: Package,
      color: '#F59E0B',
      route: '/(admin)/products'
    }
  ];

  const quickActions = [
    { title: 'Add Product', icon: Package, route: '/(admin)/products' },
    { title: 'View Orders', icon: ShoppingBag, route: '/(admin)/orders' },
    { title: 'Manage Users', icon: Users, route: '/(admin)/users' },
    { title: 'Analytics', icon: TrendingUp, route: '/analytics' },
  ];

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back, {user.name}!</Text>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {dashboardCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statCard}
                onPress={() => router.push(card.route as any)}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: card.color + '20' }]}>
                    <card.icon size={24} color={card.color} />
                  </View>
                  {card.growth !== 0 && (
                    <View style={styles.growthContainer}>
                      <TrendingUp size={12} color={card.growth > 0 ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.growthText, { color: card.growth > 0 ? '#10B981' : '#EF4444' }]}>
                        {card.growth > 0 ? '+' : ''}{card.growth.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                >
                  <action.icon size={24} color="#2563EB" />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityContainer}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Users size={16} color="#10B981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>New user registered</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <ShoppingBag size={16} color="#3B82F6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Order #123 completed</Text>
                  <Text style={styles.activityTime}>4 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Package size={16} color="#F59E0B" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Product added to inventory</Text>
                  <Text style={styles.activityTime}>6 hours ago</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
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
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});