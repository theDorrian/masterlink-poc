import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

export default function LoginScreen({ navigation, route }) {
  const role = route.params?.role || 'customer';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      await login(res.data.token, res.data.user);
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>MasterLink</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue to your account</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Log in</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.noAccount}>Don't have an account?</Text>
        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate('Register', { role })}
        >
          <Text style={styles.signupBtnText}>Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 24, paddingTop: 60 },
  brand: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 28 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8, color: '#9CA3AF' },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' },
  forgotWrap: { alignItems: 'flex-end', marginTop: 10 },
  forgot: { color: '#E8781A', fontSize: 14, fontWeight: '600' },
  loginBtn: {
    backgroundColor: '#E8781A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 14 },
  noAccount: { textAlign: 'center', color: '#6B7280', marginBottom: 12, fontSize: 14 },
  signupBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  signupBtnText: { fontWeight: '700', fontSize: 16, color: '#111827' },
  terms: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});
