import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { tradesmensApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TradesmanDetailScreen({ navigation, route }) {
  const { tradesman: initial } = route.params;
  const { role, user } = useAuth();

  const [tradesman, setTradesman] = useState(initial);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tradesmensApi.getById(initial.id)
      .then(res => {
        setTradesman(res.data.tradesman);
        setReviews(res.data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initial.id]);

  const {
    name, trade, city, hourly_rate, call_out_fee,
    avg_rating, review_count, is_available, years_experience, bio, avatar_url,
  } = tradesman;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name?.[0] || '?'}</Text>
          <View style={[styles.dot, { backgroundColor: is_available ? '#22C55E' : '#9CA3AF' }]} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.trade}>{trade}</Text>

        <View style={styles.statsRow}>
          <Stat label="Rating" value={avg_rating > 0 ? `★ ${avg_rating.toFixed(1)}` : 'New'} />
          <View style={styles.statDivider} />
          <Stat label="Jobs" value={`${review_count}+`} />
          <View style={styles.statDivider} />
          <Stat label="Experience" value={`${years_experience || 1}yr`} />
          <View style={styles.statDivider} />
          <Stat label="Status" value={is_available ? '🟢 Now' : '⚫ Later'} />
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{bio || 'Professional tradesmen with years of experience.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceCard}>
            <Text style={styles.priceValue}>£{hourly_rate}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceValue}>£{call_out_fee || 50}</Text>
            <Text style={styles.priceLabel}>call-out fee</Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceValue}>📍 {city}</Text>
            <Text style={styles.priceLabel}>location</Text>
          </View>
        </View>
        <Text style={styles.priceNote}>
          Final price determined after inspection. Not charged until job completed.
        </Text>
      </View>

      {/* Reviews */}
      {loading ? (
        <ActivityIndicator color="#E8781A" style={{ marginVertical: 20 }} />
      ) : reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{r.reviewer_name}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              </View>
              {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaWrap}>
        {role === 'customer' ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('JobRequest', { tradesman })}
          >
            <Text style={styles.ctaBtnText}>Request Job</Text>
          </TouchableOpacity>
        ) : user?.id === tradesman.id ? (
          <View style={styles.ownProfile}>
            <Text style={styles.ownProfileText}>This is your profile</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>{value}</Text>
      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8781A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 32 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  trade: { fontSize: 15, color: '#E8781A', fontWeight: '600', marginTop: 4, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
  },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  bio: { fontSize: 14, color: '#374151', lineHeight: 22 },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  priceLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  priceNote: { fontSize: 12, color: '#9CA3AF', marginTop: 10, textAlign: 'center' },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewerName: { fontWeight: '600', fontSize: 14, color: '#111827' },
  reviewStars: { color: '#F59E0B', fontSize: 14 },
  reviewComment: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  ctaWrap: { padding: 16, marginTop: 8 },
  ctaBtn: {
    backgroundColor: '#E8781A',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  ownProfile: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  ownProfileText: { color: '#6B7280', fontWeight: '600' },
});
