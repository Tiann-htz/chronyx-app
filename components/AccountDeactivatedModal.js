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

export default function AccountDeactivatedModal({ visible, onClose, employeeName }) {
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
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={48} color="#ef4444" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Account Deactivated</Text>

            {/* Message */}
            <Text style={styles.message}>
              We're sorry, <Text style={styles.employeeName}>{employeeName}</Text>, 
              but your account has been deactivated and you are unable to access the system at this time.
            </Text>

            {/* Reason Box */}
            <View style={styles.reasonBox}>
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <Text style={styles.reasonText}>
                Your account may have been deactivated due to administrative actions, 
                company policy, or security concerns.
              </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>What should I do?</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                <Text style={styles.instructionText}>
                  Contact your HR department or supervisor for more information
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                <Text style={styles.instructionText}>
                  Request account reactivation if appropriate
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                <Text style={styles.instructionText}>
                  Do not share your login credentials with others
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.contactBox}>
              <Ionicons name="call" size={18} color="#64748b" />
              <Text style={styles.contactText}>
                Please contact the HR Department for assistance with account reactivation.
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
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
    padding: 28,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  employeeName: {
    fontWeight: '700',
    color: '#1e293b',
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    width: '100%',
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
    marginLeft: 10,
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 10,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
    width: '100%',
  },
  contactText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#64748b',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});