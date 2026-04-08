import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role === 'tradesman' ? '🔧 Tradesman' : '👤 Customer'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="📋" label="My Jobs" />
        <MenuItem icon="⭐" label="Reviews" />
        <MenuItem icon="📍" label="Saved Addresses" />
        <MenuItem icon="💳" label="Payment Methods" />
        <MenuItem icon="🔔" label="Notifications" />
        <MenuItem icon="❓" label="Help & Support" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>MasterLink PoC v1.0.0</Text>
    </View>
  );
}

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8781A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 32 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF3E8',
    borderRadius: 8,
  },
  roleText: { fontSize: 13, color: '#E8781A', fontWeight: '700' },
  menu: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderRadius: 14,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#D1D5DB' },
  logoutBtn: {
    marginTop: 16,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 16 },
});
