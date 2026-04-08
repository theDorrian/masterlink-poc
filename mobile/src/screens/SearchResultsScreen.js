import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { tradesmensApi } from '../api/client';
import TradesmanCard from '../components/TradesmanCard';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { key: 'rate_asc', label: 'Rate (Low to High)' },
  { key: 'distance', label: 'Distance (Nearest)' },
  { key: 'rating_desc', label: 'Rating (Highest)' },
  { key: 'available', label: 'Availability' },
];

export default function SearchResultsScreen({ navigation, route }) {
  const { role } = useAuth();
  const filters = route.params?.filters || {};

  const [tradesmen, setTradesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('rate_asc');
  const [showSort, setShowSort] = useState(false);

  const fetchTradesmen = useCallback(async (extraFilters = {}) => {
    try {
      const params = { ...filters, ...extraFilters };
      if (search) params.city = search;
      const res = await tradesmensApi.list(params);
      let data = res.data.tradesmen || [];
      if (sortKey === 'rating_desc') data = [...data].sort((a, b) => b.avg_rating - a.avg_rating);
      if (sortKey === 'available') data = [...data].sort((a, b) => b.is_available - a.is_available);
      setTradesmen(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, search, sortKey]);

  useEffect(() => { fetchTradesmen(); }, [filters, sortKey]);

  const onRefresh = () => { setRefreshing(true); fetchTradesmen(); };

  const handleSearch = () => fetchTradesmen({ city: search });

  const currentSort = SORT_OPTIONS.find(o => o.key === sortKey)?.label || 'Sort by: Rate';

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tradesmen..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => navigation.navigate('Filter', { currentFilters: filters })}
        >
          <Text style={{ fontSize: 18 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.countText}>
          Showing {tradesmen.length} tradesmen nearby
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Text style={styles.sortBtnText}>Sort: {SORT_OPTIONS.find(o=>o.key===sortKey)?.label.split(' ')[0]} ∧</Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortOption}
              onPress={() => { setSortKey(opt.key); setShowSort(false); }}
            >
              <Text style={[styles.sortOptionText, sortKey === opt.key && { color: '#E8781A', fontWeight: '700' }]}>
                {opt.label}
              </Text>
              {sortKey === opt.key && <Text style={{ color: '#E8781A' }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#E8781A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tradesmen}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8781A" />}
          renderItem={({ item }) => (
            <TradesmanCard
              tradesman={item}
              onPress={() => navigation.navigate('TradesmanDetail', { tradesman: item })}
              onContact={() => {
                if (role === 'customer') {
                  navigation.navigate('JobRequest', { tradesman: item });
                } else {
                  navigation.navigate('TradesmanDetail', { tradesman: item });
                }
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No tradesmen found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#111827' },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  countText: { fontSize: 13, color: '#6B7280' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  sortDropdown: {
    position: 'absolute',
    right: 16,
    top: 112,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 180,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sortOptionText: { fontSize: 14, color: '#374151' },
  list: { padding: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
});
