import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

export default function Sidebar({ visible, onClose, navigation, currentRoute }) {
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      slideAnim.setValue(-SIDEBAR_WIDTH);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          onClose();
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleNavigate = (screenName) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 100);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const menuItems = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'My Account', icon: 'person', screen: 'MyAccount' },
    { name: 'My Payroll', icon: 'cash', screen: 'Payroll' },
    { name: 'My Attendance', icon: 'calendar', screen: 'Attendance' },
  ];

  if (!isVisible && !visible) {
    return null;
  }

  return (
    <Modal visible={isVisible || visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <Animated.View style={[styles.overlayBackground, { opacity: fadeAnim }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userContainer}>
              <View style={styles.avatarWrapper}>
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
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => {
              const isActive = currentRoute === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isActive ? '#1a365d' : '#64748b'}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ffffff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    backgroundColor: '#105891',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#38aa62ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#F1F5F9',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  menuTextActive: {
    color: '#1a365d',
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ce4a4aff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 5,
  },
});