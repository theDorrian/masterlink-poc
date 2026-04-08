import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ImageBackground, StatusBar,
} from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.logo}>
          Master<Text style={styles.logoAccent}>L</Text>ink
        </Text>
        <Text style={styles.tagline}>Find reliable tradesmen instantly</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login', { role: 'customer' })}
        >
          <Text style={styles.primaryBtnText}>Join as customer →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login', { role: 'tradesman' })}
        >
          <Text style={styles.secondaryBtnText}>Join as tradesman</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login', { role: 'customer' })}>
          <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoAccent: { color: '#E8781A' },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#E8781A',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  loginLink: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  loginLinkBold: { fontWeight: '700', color: '#fff' },
});
