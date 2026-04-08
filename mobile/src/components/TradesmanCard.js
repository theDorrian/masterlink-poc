import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TradesmanCard({ tradesman, onPress, onContact }) {
  const {
    name, trade, city, hourly_rate, avg_rating, review_count,
    is_available, distance_km, avatar_url,
  } = tradesman;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name?.[0] || '?'}</Text>
          <View style={[styles.dot, { backgroundColor: is_available ? '#22C55E' : '#9CA3AF' }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {avg_rating > 0 && (
              <Text style={styles.rating}>★ {avg_rating.toFixed(1)} ({review_count})</Text>
            )}
          </View>
          <Text style={styles.trade}>{trade}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>📍 {city}</Text>
            {distance_km != null && (
              <Text style={styles.meta}>  {distance_km.toFixed(1)} km</Text>
            )}
            {is_available
              ? <Text style={[styles.availBadge, { backgroundColor: '#DCFCE7', color: '#16A34A' }]}>Available Now</Text>
              : <Text style={[styles.availBadge, { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}>Avail. Later</Text>}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.rate}>£{hourly_rate}<Text style={styles.rateUnit}>/hr</Text></Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
            <Text style={styles.viewBtnText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={onContact || onPress}>
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  row: { flexDirection: 'row', marginBottom: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8781A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 16, color: '#111827', flex: 1 },
  rating: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
  trade: { fontSize: 13, color: '#E8781A', fontWeight: '600', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 6 },
  meta: { fontSize: 12, color: '#6B7280' },
  availBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rate: { fontSize: 20, fontWeight: '900', color: '#111827' },
  rateUnit: { fontSize: 14, fontWeight: '400', color: '#6B7280' },
  actions: { flexDirection: 'row', gap: 8 },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  contactBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#E8781A',
  },
  contactBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
