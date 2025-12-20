import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { pickImageFromGallery, takePhotoWithCamera, uploadImageToCloudinary } from '../utils/imageUpload';
import axios from 'axios';

const API_URL = 'https://chronyx-app.vercel.app/api/chronyxApi';

export default function MyAccountScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [accountInfo, setAccountInfo] = useState({
    createdAt: null,
    updatedAt: null,
  });

  // Profile form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
  if (user?.avatarUrl) {
    setAvatarUrl(user.avatarUrl);
  }
}, [user?.avatarUrl]);

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
    fetchAccountInfo();
    fetchUserProfile();
  }, [navigation]);

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}?endpoint=get-account-info&userId=${user.id}`
      );
      if (response.data.success) {
        setAccountInfo({
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        });
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}?endpoint=get-profile&userId=${user.id}`
      );
      if (response.data.success && response.data.user.avatarUrl) {
        setAvatarUrl(response.data.user.avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}?endpoint=update-profile`, {
        userId: user.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });

      if (response.data.success) {
        await updateUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        });

        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
        fetchAccountInfo();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}?endpoint=change-password`, {
        userId: user.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswords({ current: false, new: false, confirm: false });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await pickImageFromGallery();
      if (imageUri) {
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhotoWithCamera();
      if (imageUri) {
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

 const uploadAvatar = async (imageUri) => {
  setLoading(true);
  try {
    // Show uploading message
    Alert.alert('Uploading', 'Please wait while we upload your photo...');

    // Upload to Cloudinary and get URL
    const uploadedUrl = await uploadImageToCloudinary(imageUri);

    // Save URL to database
    const response = await axios.post(`${API_URL}?endpoint=update-avatar`, {
      userId: user.id,
      avatarUrl: uploadedUrl,
    });

    if (response.data.success) {
      // Update local state first for immediate UI update
      setAvatarUrl(uploadedUrl);
      
      // Update context
      await updateUser({
        avatarUrl: uploadedUrl,
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
      
      // Refresh account info
      fetchAccountInfo();
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    Alert.alert(
      'Error', 
      error.message || 'Failed to upload profile picture. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header Card with Avatar */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.avatarEditButton}
                  onPress={handleChangeAvatar}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <View style={styles.employeeIdBadge}>
                  <Ionicons name="card" size={14} color="#64748b" />
                  <Text style={styles.employeeIdText}>ID: {user?.id}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Profile Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.cardTitle}>Profile Information</Text>
              </View>
              <TouchableOpacity
                onPress={handleEditToggle}
                style={[styles.iconButton, isEditing && styles.iconButtonActive]}
              >
                <Ionicons
                  name={isEditing ? 'close' : 'pencil'}
                  size={20}
                  color={isEditing ? '#ef4444' : '#64748b'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={14} color="#64748b" /> First Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    placeholder="Enter first name"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <View style={styles.inputReadOnly}>
                    <Text style={styles.inputReadOnlyText}>{user?.firstName}</Text>
                  </View>
                )}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={14} color="#64748b" /> Last Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    placeholder="Enter last name"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <View style={styles.inputReadOnly}>
                    <Text style={styles.inputReadOnlyText}>{user?.lastName}</Text>
                  </View>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="mail-outline" size={14} color="#64748b" /> Email Address
                </Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <View style={styles.inputReadOnly}>
                    <Text style={styles.inputReadOnlyText}>{user?.email}</Text>
                  </View>
                )}
              </View>

              {/* Update Button */}
              {isEditing && (
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.updateButtonText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Security Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.cardTitle}>Security</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.securityButton}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.securityButtonLeft}>
                <View style={styles.securityIconContainer}>
                  <Ionicons name="key" size={20} color="#f59e0b" />
                </View>
                <View style={styles.securityButtonTextContainer}>
                  <Text style={styles.securityButtonTitle}>Change Password</Text>
                  <Text style={styles.securityButtonSubtitle}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* Account Activity Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.iconCircle, { backgroundColor: '#ddd6fe' }]}>
                  <Ionicons name="time" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.cardTitle}>Account Activity</Text>
              </View>
            </View>

            <View style={styles.activityContainer}>
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name="calendar" size={20} color="#10b981" />
                </View>
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityLabel}>Member Since</Text>
                  <Text style={styles.activityValue}>
                    {formatDate(accountInfo.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name="refresh" size={20} color="#3b82f6" />
                </View>
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityLabel}>Last Updated</Text>
                  <Text style={styles.activityValue}>
                    {formatDate(accountInfo.updatedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.modalTitle}>Change Password</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setShowPasswords({ current: false, new: false, confirm: false });
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close-circle" size={32} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.currentPassword}
                    onChangeText={(text) =>
                      setPasswordData({ ...passwordData, currentPassword: text })
                    }
                    placeholder="Enter current password"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={!showPasswords.current}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.current ? 'eye-off' : 'eye'}
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.newPassword}
                    onChangeText={(text) =>
                      setPasswordData({ ...passwordData, newPassword: text })
                    }
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={!showPasswords.new}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.new ? 'eye-off' : 'eye'}
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) =>
                      setPasswordData({ ...passwordData, confirmPassword: text })
                    }
                    placeholder="Re-enter new password"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={!showPasswords.confirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.confirm ? 'eye-off' : 'eye'}
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                    <Text style={styles.changePasswordButtonText}>
                      Update Password
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Sidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="MyAccount"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    marginLeft: 15,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#38aa62ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileHeaderInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  employeeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  employeeIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitleContainer: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#fee2e2',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#38aa62ff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  inputReadOnly: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
  },
  inputReadOnlyText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#38aa62ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#38aa62ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fefce8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  securityButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityButtonTextContainer: {
    flex: 1,
  },
  securityButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  securityButtonSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  activityContainer: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 0,
  },
  modalOverlay: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  inputIcon: {
    marginLeft: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 14,
  },
  changePasswordButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changePasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});