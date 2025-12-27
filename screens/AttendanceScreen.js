import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AttendanceFilterModal from '../components/AttendanceFilterModal';
import axios from 'axios';

const API_URL = 'https://chronyx-app.vercel.app/api/chronyxApi';

export default function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
 const [monthlySummary, setMonthlySummary] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter state - now mutable
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Set header with menu button
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

    fetchAttendanceData();
  }, [navigation]);


   // Add useEffect to refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchAttendanceData();
    }
  }, [currentMonth, currentYear, selectedStatus]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceHistory(),
        fetchMonthlySummary(),
      ]);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
  };

  const fetchAttendanceHistory = async () => {
    try {
      let url = `${API_URL}?endpoint=get-attendance-history&employeeId=${user.id}&month=${currentMonth}&year=${currentYear}`;
      
      // Add status filter if not 'all'
      if (selectedStatus !== 'all') {
        url += `&status=${selectedStatus}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setAttendanceHistory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const response = await axios.get(
        `${API_URL}?endpoint=get-monthly-summary&employeeId=${user.id}&month=${currentMonth}&year=${currentYear}`
      );

      if (response.data.success) {
        setMonthlySummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      setMonthlySummary(null);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time from 24hr to 12hr
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    const [hours, minutes, seconds] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate hours worked
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '0.00';
    
    const timeInDate = new Date(`2000-01-01 ${timeIn}`);
    const timeOutDate = new Date(`2000-01-01 ${timeOut}`);
    const diff = (timeOutDate - timeInDate) / (1000 * 60 * 60);
    
    return diff.toFixed(2);
  };

  // Get status icon and color
  const getStatusConfig = (status) => {
    const statusMap = {
      'on-time': { icon: 'checkmark-circle', color: '#10b981', label: 'On Time', bg: '#d1fae5' },
      'late': { icon: 'alert-circle', color: '#ef4444', label: 'Late', bg: '#fee2e2' },
      'overtime': { icon: 'time', color: '#3b82f6', label: 'Overtime', bg: '#dbeafe' },
      'undertime': { icon: 'time-outline', color: '#f59e0b', label: 'Undertime', bg: '#fef3c7' },
      'completed': { icon: 'checkmark-done-circle', color: '#10b981', label: 'Completed', bg: '#d1fae5' },
    };

    return statusMap[status] || { 
      icon: 'help-circle', 
      color: '#94A3B8', 
      label: 'Unknown',
      bg: '#f1f5f9'
    };
  };

  // Group attendance by date
  const groupedAttendance = attendanceHistory.reduce((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        timeIn: null,
        timeOut: null,
        status: null,
        late_minutes: 0,
        overtime_minutes: 0,
        undertime_minutes: 0,
      };
    }

    if (record.action_type === 'time-in') {
      acc[dateKey].timeIn = record.time;
      acc[dateKey].status = record.status;
      acc[dateKey].late_minutes = record.late_minutes;
    } else if (record.action_type === 'time-out') {
      acc[dateKey].timeOut = record.time;
      acc[dateKey].status = record.status;
      acc[dateKey].overtime_minutes = record.overtime_minutes;
      acc[dateKey].undertime_minutes = record.undertime_minutes;
    }

    return acc;
  }, {});

  // Convert to array and sort by date (newest first)
  const sortedAttendance = Object.values(groupedAttendance).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Get current month name
  const getMonthName = () => {
    const date = new Date(currentYear, currentMonth - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setCurrentMonth(filters.month);
    setCurrentYear(filters.year);
    setSelectedStatus(filters.status);
    
    // Fetch new data will be triggered by useEffect
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
          {/* Monthly Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleContainer}>
                <Ionicons name="calendar" size={24} color="#1a365d" />
                <Text style={styles.summaryTitle}>{getMonthName()} Summary</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1a365d" size="large" />
              </View>
            ) : monthlySummary ? (
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <Text style={styles.statValue}>{monthlySummary.totalDaysPresent}</Text>
                  <Text style={styles.statLabel}>Days Present</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="time" size={32} color="#3b82f6" />
                  <Text style={styles.statValue}>{monthlySummary.totalHours}</Text>
                  <Text style={styles.statLabel}>Total Hours</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="alert-circle" size={32} color="#ef4444" />
                  <Text style={styles.statValue}>{monthlySummary.totalLate}</Text>
                  <Text style={styles.statLabel}>Late Count</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="trending-up" size={32} color="#f59e0b" />
                  <Text style={styles.statValue}>{monthlySummary.totalOvertime}</Text>
                  <Text style={styles.statLabel}>Overtime</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No summary available</Text>
              </View>
            )}
          </View>

          {/* Attendance History Header */}
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Attendance History</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#1a365d" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Attendance History List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#1a365d" size="large" />
            </View>
          ) : sortedAttendance.length > 0 ? (
            sortedAttendance.map((record, index) => {
              const statusConfig = getStatusConfig(record.status);
              const hoursWorked = calculateHours(record.timeIn, record.timeOut);

              return (
                <View key={index} style={styles.attendanceCard}>
                  {/* Date Header */}
                  <View style={styles.dateHeader}>
                    <Ionicons name="calendar-outline" size={18} color="#64748b" />
                    <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                  </View>

                  {/* Time Details */}
                  <View style={styles.timeDetailsContainer}>
                    <View style={styles.timeRow}>
                      <View style={styles.timeItem}>
                        <Ionicons name="log-in-outline" size={20} color="#10b981" />
                        <View style={styles.timeTextContainer}>
                          <Text style={styles.timeLabel}>Time In</Text>
                          <Text style={styles.timeValue}>{formatTime(record.timeIn)}</Text>
                        </View>
                      </View>

                      <View style={styles.timeItem}>
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <View style={styles.timeTextContainer}>
                          <Text style={styles.timeLabel}>Time Out</Text>
                          <Text style={styles.timeValue}>
                            {record.timeOut ? formatTime(record.timeOut) : '--:--'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Hours Worked */}
                    <View style={styles.hoursContainer}>
                      <Ionicons name="hourglass-outline" size={18} color="#64748b" />
                      <Text style={styles.hoursText}>
                        {record.timeOut ? `${hoursWorked} hours` : 'Incomplete'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>

                  {/* Additional Info (Late/Overtime/Undertime) */}
                  {(record.late_minutes > 0 || 
                    record.overtime_minutes > 0 || 
                    record.undertime_minutes > 0) && (
                    <View style={styles.additionalInfo}>
                      {record.late_minutes > 0 && (
                        <View style={styles.infoItem}>
                          <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                          <Text style={styles.infoText}>
                            Late: {record.late_minutes} min
                          </Text>
                        </View>
                      )}
                      {record.overtime_minutes > 0 && (
                        <View style={styles.infoItem}>
                          <Ionicons name="time-outline" size={14} color="#3b82f6" />
                          <Text style={styles.infoText}>
                            OT: {record.overtime_minutes} min
                          </Text>
                        </View>
                      )}
                      {record.undertime_minutes > 0 && (
                        <View style={styles.infoItem}>
                          <Ionicons name="time-outline" size={14} color="#f59e0b" />
                          <Text style={styles.infoText}>
                            UT: {record.undertime_minutes} min
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Attendance Records</Text>
              <Text style={styles.emptyText}>
                Your attendance records for {getMonthName()} will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Sidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Attendance"
      />

      <AttendanceFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
        currentFilters={{
          month: currentMonth,
          year: currentYear,
          status: selectedStatus,
        }}
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
    padding: 16,
  },
  headerButton: {
    marginLeft: 15,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a365d',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a365d',
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a365d',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a365d',
    marginLeft: 6,
  },
  
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a365d',
    marginLeft: 8,
  },
  timeDetailsContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeTextContainer: {
    marginLeft: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});