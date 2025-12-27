import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceFilterModal({ visible, onClose, onApply, currentFilters }) {
  const [selectedMonth, setSelectedMonth] = useState(currentFilters.month);
  const [selectedYear, setSelectedYear] = useState(currentFilters.year);
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate years (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const statuses = [
    { value: 'all', label: 'All Status', icon: 'apps', color: '#64748b' },
    { value: 'on-time', label: 'On Time', icon: 'checkmark-circle', color: '#10b981' },
    { value: 'late', label: 'Late', icon: 'alert-circle', color: '#ef4444' },
    { value: 'overtime', label: 'Overtime', icon: 'time', color: '#3b82f6' },
    { value: 'undertime', label: 'Undertime', icon: 'time-outline', color: '#f59e0b' },
    { value: 'completed', label: 'Completed', icon: 'checkmark-done-circle', color: '#10b981' },
  ];

  const handleApply = () => {
    onApply({
      month: selectedMonth,
      year: selectedYear,
      status: selectedStatus,
    });
    onClose();
  };

  const handleReset = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setSelectedStatus('all');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="filter" size={20} color="#1a365d" />
              </View>
              <Text style={styles.title}>Filter Attendance</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Month Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="calendar-outline" size={16} color="#1a365d" /> Month
              </Text>
              <View style={styles.optionsGrid}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    style={[
                      styles.optionButton,
                      selectedMonth === month.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setSelectedMonth(month.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedMonth === month.value && styles.optionTextActive,
                      ]}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="calendar" size={16} color="#1a365d" /> Year
              </Text>
              <View style={styles.yearContainer}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      selectedYear === year && styles.yearButtonActive,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        selectedYear === year && styles.yearTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="pulse-outline" size={16} color="#1a365d" /> Status
              </Text>
              <View style={styles.statusContainer}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      selectedStatus === status.value && styles.statusButtonActive,
                    ]}
                    onPress={() => setSelectedStatus(status.value)}
                  >
                    <Ionicons
                      name={status.icon}
                      size={20}
                      color={
                        selectedStatus === status.value
                          ? status.color
                          : '#94a3b8'
                      }
                    />
                    <Text
                      style={[
                        styles.statusText,
                        selectedStatus === status.value && { color: status.color },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color="#64748b" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 24,
    maxHeight: 500,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#1a365d',
    borderColor: '#1a365d',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  yearButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: '#1a365d',
    borderColor: '#1a365d',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  yearTextActive: {
    color: '#ffffff',
  },
  statusContainer: {
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statusButtonActive: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#1a365d',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});