import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

export default function QRCodeModal({ visible, onClose, qrData, userName, isActive = true, navigation }) {  // Generate QR code URL using a free API
  const qrCodeUrl = qrData 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`
    : null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>My QR Code</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content - Show different UI based on active status */}
            {isActive ? (
              // ACTIVE QR CODE - Show QR as normal
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  {qrCodeUrl ? (
                    <Image
                      source={{ uri: qrCodeUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.noQrText}>No QR Code Available</Text>
                  )}
                </View>
                
                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.qrId}>QR ID: {qrData}</Text>
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                  <Text style={styles.instructionTitle}>How to use:</Text>
                  <Text style={styles.instructionText}>
                    • Show this QR code to scan for Time In/Out
                  </Text>
                  <Text style={styles.instructionText}>
                    • Keep your QR code private and secure
                  </Text>
                  <Text style={styles.instructionText}>
                    • Do not share screenshots with others
                  </Text>
                </View>
              </View>
            ) : (
              // DEACTIVATED QR CODE - Show warning message
              <View style={styles.deactivatedContainer}>
                <View style={styles.deactivatedIconCircle}>
                  <Ionicons name="alert-circle" size={64} color="#ef4444" />
                </View>

                <Text style={styles.deactivatedTitle}>QR Code Deactivated</Text>
                
                <Text style={styles.deactivatedMessage}>
                  We're sorry, but your QR code has been temporarily deactivated by an administrator. 
                  You will not be able to use it for attendance until it has been reactivated.
                </Text>

                <View style={styles.deactivatedInfoBox}>
                  <View style={styles.infoBoxHeader}>
                    <Ionicons name="information-circle" size={20} color="#3b82f6" />
                    <Text style={styles.infoBoxTitle}>What should I do?</Text>
                  </View>
                  <Text style={styles.infoBoxText}>
                    Please check your <Text style={styles.infoBoxTextBold}>Notifications</Text> to 
                    see the reason for deactivation and next steps to resolve this issue.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.viewNotificationsButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Notifications');
                  }}
                >
                  <Ionicons name="notifications" size={20} color="#ffffff" />
                  <Text style={styles.viewNotificationsText}>View Notifications</Text>
                </TouchableOpacity>

                <View style={styles.contactBox}>
                  <Ionicons name="call-outline" size={18} color="#64748b" />
                  <Text style={styles.contactText}>
                    Need help? Contact your HR department or supervisor for assistance.
                  </Text>
                </View>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.doneButton, !isActive && styles.doneButtonDeactivated]}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>
                {isActive ? 'Done' : 'Close'}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#718096',
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    width: 290,
    height: 290,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  noQrText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  qrId: {
    fontSize: 14,
    color: '#718096',
  },
  instructions: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4,
  },
  doneButton: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButtonDeactivated: {
    backgroundColor: '#64748b',
  },
  deactivatedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  deactivatedIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deactivatedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
  },
  deactivatedMessage: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  deactivatedInfoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    width: '100%',
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  infoBoxTextBold: {
    fontWeight: '700',
    color: '#1e40af',
  },
  viewNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewNotificationsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  contactText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  
});