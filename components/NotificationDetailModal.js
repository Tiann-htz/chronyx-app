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

  // Format date with Philippine Time (UTC+8)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    // Convert to Philippine Time (UTC+8)
    const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    
    return phTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    });
  };

  // Format deactivation reason - remove underscores and capitalize properly
  const formatReason = (reason) => {
    if (!reason) return null;
    
    // Replace underscores with spaces and capitalize each word
    return reason
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get appropriate intro message based on reason
  const getReasonMessage = (reason) => {
    if (!reason) {
      return "We apologize for the inconvenience, but your QR code has been temporarily deactivated. No specific reason was provided by the administrator. Please contact your HR department or supervisor for more information.";
    }

    const formattedReason = formatReason(reason);
    
    // Custom messages based on reason type
    const reasonMessages = {
      'Excessive Absences': `We regret to inform you that your QR code has been deactivated due to ${formattedReason.toLowerCase()}. Please coordinate with your supervisor or HR department to address this matter and have your QR code reactivated.`,
      
      'Unauthorized Overtime': `Your QR code has been temporarily deactivated because of ${formattedReason.toLowerCase()}. Please speak with your immediate supervisor to clarify your work schedule and have this issue resolved.`,
      
      'Suspicious Activity': `For security purposes, your QR code has been deactivated due to ${formattedReason.toLowerCase()}. Please contact the HR department immediately to verify your identity and resolve this matter.`,
      
      'Employee Request': `Your QR code has been deactivated upon your request. If you did not request this deactivation or wish to have it reactivated, please contact the HR department as soon as possible.`,
      
      'Security Concern': `Your QR code has been deactivated due to a ${formattedReason.toLowerCase()}. Please visit the HR department to address this security issue and have your access restored.`,
      
      'Other': `We apologize for the inconvenience, but your QR code has been deactivated. The administrator has noted: "${formattedReason}". Please contact your HR department or supervisor for clarification and to have your QR code reactivated.`
    };

    return reasonMessages[formattedReason] || reasonMessages['Other'];
  };

  const formattedReason = formatReason(notification.deactivation_reason);
  const reasonMessage = getReasonMessage(notification.deactivation_reason);

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
                  <Text style={styles.infoValueDate}>
                    {formatDate(notification.deactivated_at)}
                  </Text>
                </View>
                {notification.admin_name && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Deactivated By</Text>
                      <View style={styles.adminInfo}>
                        <Ionicons name="person" size={16} color="#64748b" />
                        <Text style={styles.adminText}>{notification.admin_name}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Reason Section with proper message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={16} color="#1a365d" /> Reason for Deactivation
              </Text>
              <View style={styles.reasonCard}>
                <View style={styles.reasonHeader}>
                  <Ionicons name="alert-circle-outline" size={24} color="#f59e0b" />
                  {formattedReason && (
                    <View style={styles.reasonTypeBadge}>
                      <Text style={styles.reasonTypeText}>{formattedReason}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.reasonMessage}>
                  {reasonMessage}
                </Text>
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
                    Contact your administrator or HR department immediately for more information about this deactivation
                  </Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>2</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Do not attempt to use your deactivated QR code for attendance or access control
                  </Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>3</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Follow the instructions provided by your supervisor to resolve this matter and have your QR code reactivated
                  </Text>
                </View>

                <View style={styles.actionItem}>
                  <View style={styles.actionNumber}>
                    <Text style={styles.actionNumberText}>4</Text>
                  </View>
                  <Text style={styles.actionText}>
                    Wait for official confirmation before attempting to use your QR code again
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.contactCard}>
              <Ionicons name="call" size={20} color="#3b82f6" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Need Help?</Text>
                <Text style={styles.contactText}>
                  Please contact the HR Department or your immediate supervisor for assistance with your QR code reactivation.
                </Text>
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
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  infoValueDate: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1.5,
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
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  reasonTypeBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  reasonTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  reasonMessage: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
    fontWeight: '500',
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  closeActionButton: {
    backgroundColor: '#1a365d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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