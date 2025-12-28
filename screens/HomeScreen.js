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
  RefreshControl,
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
  const [qrIsActive, setQrIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingQR, setCheckingQR] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  
  // New state for real data
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [timePolicy, setTimePolicy] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    checkUserQR();
    fetchAllData();
  }, []);

  // Add menu button to header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSidebar(true)}
        >
          <View>
            <Ionicons name="menu" size={28} color="#ffffff" />
            {unreadNotifications > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          `${API_URL}?endpoint=get-notifications&employeeId=${user.id}`
        );
        if (response.data.success) {
          setUnreadNotifications(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every time screen is focused
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        fetchTodayAttendance(),
        fetchTimePolicy(),
        fetchMonthlyStats(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(
        `${API_URL}?endpoint=get-today-attendance&employeeId=${user.id}`
      );
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setTodayAttendance(null);
    }
  };

  const fetchTimePolicy = async () => {
    try {
      const response = await axios.get(`${API_URL}?endpoint=get-time-policy`);
      if (response.data.success) {
        setTimePolicy(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching time policy:', error);
      setTimePolicy(null);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const response = await axios.get(
        `${API_URL}?endpoint=get-monthly-stats&employeeId=${user.id}&month=${month}&year=${year}`
      );
      if (response.data.success) {
        setMonthlyStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      setMonthlyStats(null);
    }
  };

  const checkUserQR = async () => {
    try {
      setCheckingQR(true);
      const response = await axios.get(
        `${API_URL}?endpoint=check-qr&userId=${user.id}`
      );

      if (response.data.success && response.data.qrCode) {
        setQrData(response.data.qrCode);
        setQrIsActive(response.data.isActive); // Add this line
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

  // Format time from 24hr to 12hr
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format time range
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not set';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'on-time': { icon: 'checkmark-circle', color: '#10b981', label: 'On Time' },
      'late': { icon: 'alert-circle', color: '#ef4444', label: 'Late' },
      'overtime': { icon: 'time', color: '#3b82f6', label: 'Overtime' },
      'undertime': { icon: 'time-outline', color: '#f59e0b', label: 'Undertime' },
      'completed': { icon: 'checkmark-done-circle', color: '#10b981', label: 'Completed' },
    };

    const config = statusConfig[status] || { icon: 'help-circle', color: '#94A3B8', label: 'Unknown' };
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  // Calculate hours worked
  const calculateHoursWorked = () => {
    if (!todayAttendance?.timeIn || !todayAttendance?.timeOut) return '0.0';
    
    const timeIn = new Date(`2000-01-01 ${todayAttendance.timeIn}`);
    const timeOut = new Date(`2000-01-01 ${todayAttendance.timeOut}`);
    const diff = (timeOut - timeIn) / (1000 * 60 * 60); // Convert to hours
    
    return diff.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                <TouchableOpacity 
                  style={[
                    styles.qrButton, 
                    qrIsActive ? styles.qrButtonActive : styles.qrButtonDeactivated
                  ]} 
                  onPress={handleShowQR}
                >
                  <Ionicons 
                    name={qrIsActive ? "qr-code" : "alert-circle"} 
                    size={24} 
                    color="#ffffff" 
                  />
                  <Text style={styles.qrButtonTextActive}>
                    {qrIsActive ? "View My QR Code" : "QR Code Deactivated"}
                  </Text>
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
            
            {loadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1a365d" />
              </View>
            ) : (
              <>
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleTime}>
                    <Ionicons name="time-outline" size={20} color="#64748b" />
                    <Text style={styles.scheduleTimeText}>
                      {timePolicy 
                        ? formatTimeRange(timePolicy.time_in_start, timePolicy.official_time_out)
                        : 'Not set'}
                    </Text>
                  </View>
                  <Text style={styles.scheduleLabel}>
                    {timePolicy 
                      ? `${timePolicy.required_hours} hours required • ${timePolicy.grace_period} min grace period`
                      : 'No schedule set'}
                  </Text>
                </View>

                {todayAttendance?.status && (
                  <View style={styles.todayStatusContainer}>
                    <Text style={styles.todayStatusLabel}>Today's Status:</Text>
                    {getStatusBadge(todayAttendance.status)}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Attendance & Stats Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color="#1a365d" />
              <Text style={styles.cardTitle}>Today's Attendance</Text>
            </View>
            
            {loadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1a365d" />
              </View>
            ) : todayAttendance ? (
              <>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="log-in-outline" size={28} color="#10b981" />
                    </View>
                    <Text style={styles.statLabel}>Time In</Text>
                    <Text style={styles.statValue}>
                      {todayAttendance.timeIn ? formatTime(todayAttendance.timeIn) : '--:--'}
                    </Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="log-out-outline" size={28} color="#ef4444" />
                    </View>
                    <Text style={styles.statLabel}>Time Out</Text>
                    <Text style={styles.statValue}>
                      {todayAttendance.timeOut ? formatTime(todayAttendance.timeOut) : '--:--'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="hourglass-outline" size={28} color="#94A3B8" />
                    </View>
                    <Text style={styles.statLabel}>Hours Today</Text>
                    <Text style={styles.statValue}>{calculateHoursWorked()} hrs</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="calendar-number-outline" size={28} color="#1a365d" />
                    </View>
                    <Text style={styles.statLabel}>This Month</Text>
                    <Text style={styles.statValue}>
                      {monthlyStats?.totalDays || 0} days
                    </Text>
                  </View>
                </View>

                {/* Additional Stats if there's late/overtime/undertime */}
                {(todayAttendance.late_minutes > 0 || 
                  todayAttendance.overtime_minutes > 0 || 
                  todayAttendance.undertime_minutes > 0) && (
                  <View style={styles.additionalStats}>
                    {todayAttendance.late_minutes > 0 && (
                      <View style={styles.additionalStatItem}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.additionalStatText}>
                          Late: {todayAttendance.late_minutes} min
                        </Text>
                      </View>
                    )}
                    {todayAttendance.overtime_minutes > 0 && (
                      <View style={styles.additionalStatItem}>
                        <Ionicons name="time" size={16} color="#3b82f6" />
                        <Text style={styles.additionalStatText}>
                          Overtime: {todayAttendance.overtime_minutes} min
                        </Text>
                      </View>
                    )}
                    {todayAttendance.undertime_minutes > 0 && (
                      <View style={styles.additionalStatItem}>
                        <Ionicons name="time-outline" size={16} color="#f59e0b" />
                        <Text style={styles.additionalStatText}>
                          Undertime: {todayAttendance.undertime_minutes} min
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                <Text style={styles.noDataText}>No attendance record yet today</Text>
                <Text style={styles.noDataSubtext}>Scan your QR code to clock in</Text>
              </View>
            )}
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
              onPress={() => navigation.navigate('Salary')}
            >
              <Ionicons name="cash" size={22} color="#1a365d" />
              <Text style={styles.actionButtonText}>Check My Salary</Text>
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
        isActive={qrIsActive}
        navigation={navigation}
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
  qrButtonDeactivated: {
    backgroundColor: '#ef4444',
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
  todayStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  todayStatusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
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
  additionalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  additionalStatText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
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

  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

});