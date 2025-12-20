import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const API_URL = 'https://chronyx-app.vercel.app/api/chronyxApi';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingQR, setCheckingQR] = useState(true);

  useEffect(() => {
    checkUserQR();
  }, []);

  // Add menu button to header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSidebar(true)}
        >
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const checkUserQR = async () => {
    try {
      setCheckingQR(true);
      const response = await axios.get(
        `${API_URL}?endpoint=check-qr&userId=${user.id}`
      );

      if (response.data.success && response.data.qrCode) {
        setQrData(response.data.qrCode);
      }
    } catch (error) {
      console.error('Error checking QR:', error);
    } finally {
      setCheckingQR(false);
    }
  };

  const handleCreateQR = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}?endpoint=create-qr`, {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });

      if (response.data.success) {
        setQrData(response.data.qrCode);
        Alert.alert('Success', 'Your QR code has been created!');
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error creating QR:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create QR code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  // Get current date info
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Welcome Container */}
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeHeader}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{getInitials()}</Text>
                  </View>
                )}
              </View>

              {/* User Info Section */}
              <View style={styles.welcomeLeft}>
                <Text style={styles.welcomeGreeting}>Welcome back,</Text>
                <Text style={styles.welcomeTitle}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.employeeId}>ID: {user?.id}</Text>
              </View>
            </View>

            {/* QR Code Button */}
            <View style={styles.qrButtonContainer}>
              {checkingQR ? (
                <View style={[styles.qrButton, styles.qrButtonLoading]}>
                  <ActivityIndicator color="#1a365d" />
                  <Text style={styles.qrButtonText}>Loading...</Text>
                </View>
              ) : qrData ? (
                <TouchableOpacity style={[styles.qrButton, styles.qrButtonActive]} onPress={handleShowQR}>
                  <Ionicons name="qr-code" size={24} color="#ffffff" />
                  <Text style={styles.qrButtonTextActive}>View My QR Code</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.qrButton, styles.qrButtonCreate]}
                  onPress={handleCreateQR}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#1a365d" />
                      <Text style={styles.qrButtonText}>Creating...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={24} color="#1a365d" />
                      <Text style={styles.qrButtonText}>Create My QR ID</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Today's Schedule Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#1a365d" />
              <Text style={styles.cardTitle}>Today's Schedule</Text>
            </View>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <Text style={styles.scheduleTimeText}>8:00 AM - 5:00 PM</Text>
              </View>
              <Text style={styles.scheduleLabel}>Regular Working Hours</Text>
            </View>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <Text style={styles.scheduleTimeText}>Main Office</Text>
              </View>
              <Text style={styles.scheduleLabel}>Work Location</Text>
            </View>
          </View>

          {/* Attendance & Stats Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color="#1a365d" />
              <Text style={styles.cardTitle}>Today's Attendance</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="log-in-outline" size={28} color="#10b981" />
                </View>
                <Text style={styles.statLabel}>Time In</Text>
                <Text style={styles.statValue}>--:--</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="log-out-outline" size={28} color="#ef4444" />
                </View>
                <Text style={styles.statLabel}>Time Out</Text>
                <Text style={styles.statValue}>--:--</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="hourglass-outline" size={28} color="#94A3B8" />
                </View>
                <Text style={styles.statLabel}>Hours Today</Text>
                <Text style={styles.statValue}>0.0 hrs</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar-number-outline" size={28} color="#1a365d" />
                </View>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>0 days</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flash" size={24} color="#1a365d" />
              <Text style={styles.cardTitle}>Quick Actions</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Attendance')}
            >
              <Ionicons name="calendar" size={22} color="#1a365d" />
              <Text style={styles.actionButtonText}>View Full Attendance</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Payroll')}
            >
              <Ionicons name="cash" size={22} color="#1a365d" />
              <Text style={styles.actionButtonText}>Check Payroll</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Home"
      />

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={qrData || ''}
        userName={`${user?.firstName} ${user?.lastName}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerButton: {
    marginLeft: 15,
  },
  welcomeContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1a365d',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSection: {
    marginRight: 16,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#f8f8f8ff',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#38aa62ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#38aa62ff',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  qrButtonContainer: {
    marginTop: 8,
  },
  qrButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonLoading: {
    backgroundColor: '#F1F5F9',
  },
  qrButtonActive: {
    backgroundColor: '#38aa62ff',
  },
  qrButtonCreate: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  qrButtonText: {
    color: '#1a365d',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  qrButtonTextActive: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1a365d',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a365d',
    marginLeft: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '500',
  },
  scheduleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginLeft: 8,
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginLeft: 12,
  },
});