import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#D97706' },
  accepted:  { bg: '#DCFCE7', text: '#16A34A' },
  declined:  { bg: '#FEE2E2', text: '#DC2626' },
  completed: { bg: '#DBEAFE', text: '#2563EB' },
};

export default function MyJobsScreen() {
  const { role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.mine();
      setJobs(res.data.jobs || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchJobs(); }, []));

  const handleStatusUpdate = async (jobId, status) => {
    try {
      await jobsApi.updateStatus(jobId, status);
      fetchJobs();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update status');
    }
  };

  const renderJob = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobMeta}>
              {role === 'customer'
                ? `${item.trade} · £${item.hourly_rate}/hr`
                : item.customer_name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={[styles.urgencyBadge, { backgroundColor: item.urgency === 'emergency' ? '#FEE2E2' : '#F3F4F6' }]}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: item.urgency === 'emergency' ? '#DC2626' : '#6B7280' }}>
              {item.urgency === 'emergency' ? '⚡ Emergency' : '📅 Flexible'}
            </Text>
          </View>
          {item.address && <Text style={styles.address} numberOfLines={1}>📍 {item.address}</Text>}
        </View>

        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>

        {/* Tradesman actions */}
        {role === 'tradesman' && item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
              onPress={() => handleStatusUpdate(item.id, 'accepted')}
            >
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => handleStatusUpdate(item.id, 'declined')}
            >
              <Text style={styles.actionBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Customer: mark complete */}
        {role === 'customer' && item.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#2563EB', alignSelf: 'flex-end', marginTop: 10 }]}
            onPress={() => handleStatusUpdate(item.id, 'completed')}
          >
            <Text style={styles.actionBtnText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8781A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>
          {role === 'tradesman' ? 'Job Requests' : 'My Jobs'}
        </Text>
        <Text style={styles.subtitle}>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={renderJob}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} tintColor="#E8781A" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No jobs yet</Text>
            <Text style={styles.emptySub}>
              {role === 'customer'
                ? 'Find a tradesman and send a job request'
                : 'Job requests from customers will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerWrap: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  header: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  jobMeta: { fontSize: 13, color: '#E8781A', fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  address: { flex: 1, fontSize: 12, color: '#6B7280' },
  date: { fontSize: 12, color: '#9CA3AF' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 6, paddingHorizontal: 32 },
});
