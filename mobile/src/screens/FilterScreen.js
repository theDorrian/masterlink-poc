import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';

const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler', 'Decorator'];
const AVAILABILITY = ['Available Now', 'This Week', 'Next Week', 'Weekends'];

export default function FilterScreen({ navigation, route }) {
  const current = route.params?.currentFilters || {};

  const [city, setCity] = useState(current.city || '');
  const [trade, setTrade] = useState(current.trade || '');
  const [minRate, setMinRate] = useState(current.min_rate ? String(current.min_rate) : '20');
  const [maxRate, setMaxRate] = useState(current.max_rate ? String(current.max_rate) : '150');
  const [minRating, setMinRating] = useState(current.min_rating ? String(current.min_rating) : '');
  const [avail, setAvail] = useState(current.available === 'true' ? 'Available Now' : '');

  const apply = () => {
    const filters = {};
    if (city) filters.city = city;
    if (trade) filters.trade = trade;
    if (minRate) filters.min_rate = minRate;
    if (maxRate) filters.max_rate = maxRate;
    if (minRating) filters.min_rating = minRating;
    if (avail === 'Available Now') filters.available = 'true';

    navigation.navigate('SearchResults', { filters });
  };

  const reset = () => {
    setCity(''); setTrade(''); setMinRate('20'); setMaxRate('150');
    setMinRating(''); setAvail('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Location */}
        <Section title="Location">
          <TextInput
            style={styles.input}
            placeholder="e.g. London"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
        </Section>

        {/* Trade Type */}
        <Section title="Trade Type">
          <View style={styles.grid}>
            {TRADES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, trade === t && styles.chipActive]}
                onPress={() => setTrade(trade === t ? '' : t)}
              >
                <Text style={[styles.chipText, trade === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Hourly Rate */}
        <Section title="Hourly Rate (£)">
          <View style={styles.rateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rateLabel}>Min</Text>
              <TextInput
                style={styles.rateInput}
                value={minRate}
                onChangeText={setMinRate}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.rateDash}>—</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rateLabel}>Max</Text>
              <TextInput
                style={styles.rateInput}
                value={maxRate}
                onChangeText={setMaxRate}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Section>

        {/* Minimum Rating */}
        <Section title="Minimum Rating">
          {[['5.0', 5], ['4.0', 4], ['3.0', 3]].map(([label, val]) => (
            <TouchableOpacity
              key={label}
              style={styles.ratingRow}
              onPress={() => setMinRating(minRating === String(val) ? '' : String(val))}
            >
              <View style={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={{ color: i < val ? '#F59E0B' : '#D1D5DB', fontSize: 16 }}>★</Text>
                ))}
                <Text style={styles.ratingLabel}> {label}</Text>
              </View>
              <View style={[styles.radio, minRating === String(val) && styles.radioActive]}>
                {minRating === String(val) && <View style={styles.radioFill} />}
              </View>
            </TouchableOpacity>
          ))}
        </Section>

        {/* Availability */}
        <Section title="Availability">
          <View style={styles.availGrid}>
            {AVAILABILITY.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.availPill, avail === a && styles.availPillActive]}
                onPress={() => setAvail(avail === a ? '' : a)}
              >
                <Text style={[styles.availText, avail === a && styles.availTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>
      </ScrollView>

      <TouchableOpacity style={styles.applyBtn} onPress={apply}>
        <Text style={styles.applyBtnText}>Show Results</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    minWidth: 90,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: '#F0FFF4', borderColor: '#22C55E' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#16A34A' },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rateLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  rateInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rateDash: { fontSize: 18, color: '#9CA3AF', marginTop: 20 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stars: { flexDirection: 'row', alignItems: 'center' },
  ratingLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#22C55E' },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  availGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  availPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  availPillActive: { backgroundColor: '#F0FFF4', borderColor: '#22C55E' },
  availText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  availTextActive: { color: '#16A34A' },
  applyBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#E8781A',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#E8781A',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
