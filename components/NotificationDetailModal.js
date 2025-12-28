import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationDetailModal({ visible, onClose, notification }) {
  if (!notification) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.iconCircle}>
                  <Ionicons name="alert-circle" size={32} color="#ef4444" />
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={36} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>QR Code Deactivation Notice</Text>
            </View>

            {/* Alert Banner */}
            <View style={styles.alertBanner}>
              <Ionicons name="warning" size={20} color="#ef4444" />
              <Text style={styles.alertText}>
                Your QR code has been deactivated by an administrator
              </Text>
            </View>

            {/* QR Code Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="qr-code" size={16} color="#1a365d" /> QR Code Information
              </Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>QR Code ID</Text>
                  <Text style={styles.infoValue}>{notification.qr_code}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Employee Name</Text>
                  <Text style={styles.infoValue}>
                    {notification.first_name} {notification.last_name}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                    <Text style={styles.statusText}>Deactivated</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Deactivation Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="information-circle" size={16} color="#1a365d" /> Deactivation Details
              </Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Deactivated On</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(notification.deactivated_at)}
                  </Text>
                </View>
                {notification.deactivated_by && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Deactivated By</Text>
                      <View style={styles.adminInfo}>
                        <Ionicons name="person" size={16} color="#64748b" />
                        <Text style={styles.adminText}>Admin ID: {notification.deactivated_by}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Reason Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={16} color="#1a365d" /> Reason for Deactivation
              </Text>
              <View style={styles.reasonCard}>
                {notification.deactivation_reason ? (
                  <>
                    <Ionicons name="chatbox-ellipses" size={24} color="#64748b" />
                    <Text style={styles.reasonText}>
                      {notification.deactivation_reason}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="help-circle-outline" size={24} color="#94a3b8" />
                    <Text style={styles.reasonTextEmpty}>
                      No reason was provided by the administrator.
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* What to Do Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="help-buoy" size={16} color="#1a365d" /> What should I do?
              </Text>
              <View style={styles.actionCard}>
                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>1</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Contact your administrator or HR department for more information
                  </Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>2</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Do not attempt to use your deactivated QR code for attendance
                  </Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>3</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Wait for your QR code to be reactivated before resuming normal attendance
                  </Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeActionButton}
              onPress={onClose}
            >
              <Text style={styles.closeActionButtonText}>I Understand</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 6,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 6,
  },
  reasonCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  reasonTextEmpty: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  actionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  actionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  closeActionButton: {
    backgroundColor: '#1a365d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1a365d',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeActionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});