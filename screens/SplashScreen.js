import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';

export default function SplashScreen({ onFinish }) {
  const logoPosition = useRef(new Animated.Value(-10)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Slide from left to center
      Animated.timing(logoPosition, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Fade in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait a bit before finishing
      setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 800);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Container with Animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateX: logoPosition }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/chronyxlogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/images/chronyxtext.png')}
          style={styles.logoText}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  logoText: {
    width: 180,
    height: 50,
  },
});