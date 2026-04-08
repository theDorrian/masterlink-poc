import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler', 'Decorator'];

export default function RegisterScreen({ navigation, route }) {
  const role = route.params?.role || 'customer';
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trade, setTrade] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }
    if (role === 'tradesman' && (!trade || !hourlyRate || !city)) {
      return Alert.alert('Error', 'Tradesmen must provide trade, rate, and city');
    }
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'tradesman') {
        payload.trade = trade;
        payload.hourly_rate = parseFloat(hourlyRate);
        payload.city = city;
      }
      const res = await authApi.register(payload);
      await login(res.data.token, res.data.user);
    } catch (err) {
      Alert.alert('Registration failed', err.response?.data?.error || 'Something went wrong');
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Sign up as a <Text style={styles.roleHighlight}>{role}</Text>
        </Text>

        <View style={styles.card}>
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="Your email" keyboard="email-address" />
          <Field label="Password" value={password} onChange={setPassword} placeholder="Min 6 characters" secure />

          {role === 'tradesman' && (
            <>
              <Text style={styles.sectionTitle}>Trade Details</Text>

              <Text style={styles.label}>Trade</Text>
              <View style={styles.tradeGrid}>
                {TRADES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tradePill, trade === t && styles.tradePillActive]}
                    onPress={() => setTrade(t)}
                  >
                    <Text style={[styles.tradePillText, trade === t && styles.tradePillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field label="Hourly Rate (£)" value={hourlyRate} onChange={setHourlyRate} placeholder="e.g. 75" keyboard="numeric" />
              <Field label="City" value={city} onChange={setCity} placeholder="e.g. London" />
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
          <Text style={styles.loginLink}>Already have an account? <Text style={{ color: '#E8781A', fontWeight: '700' }}>Log in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, keyboard, secure }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboard || 'default'}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
        secureTextEntry={secure}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  brand: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  roleHighlight: { color: '#E8781A', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
    color: '#111827',
  },
  tradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tradePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  tradePillActive: { backgroundColor: '#FFF3E8', borderColor: '#E8781A' },
  tradePillText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tradePillTextActive: { color: '#E8781A' },
  btn: {
    backgroundColor: '#E8781A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loginLink: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
});
