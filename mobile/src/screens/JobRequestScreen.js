import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { jobsApi } from '../api/client';

export default function JobRequestScreen({ navigation, route }) {
  const { tradesman } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState('flexible');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    if (photos.length >= 3) return Alert.alert('Max 3 photos');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title) return Alert.alert('Error', 'Please enter a job title');
    setLoading(true);
    try {
      await jobsApi.create({
        tradesman_id: tradesman.id,
        title,
        description,
        address,
        city: tradesman.city,
        urgency,
        offered_fee: tradesman.hourly_rate,
        photos: [],
      });
      Alert.alert('Request Sent!', 'Your job request has been sent to ' + tradesman.name, [
        { text: 'OK', onPress: () => navigation.navigate('SearchResults') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Tradesman Header */}
        <View style={styles.tradesmanHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{tradesman.name?.[0]}</Text>
            <View style={[styles.dot, { backgroundColor: tradesman.is_available ? '#22C55E' : '#9CA3AF' }]} />
          </View>
          <View>
            <Text style={styles.tradesmanName}>{tradesman.name}</Text>
            <Text style={styles.tradesmanTrade}>{tradesman.trade}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>★ {tradesman.avg_rating?.toFixed(1)}</Text>
              <Text style={styles.jobs}> • {tradesman.review_count}+ Jobs</Text>
            </View>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe the job</Text>

          <Text style={styles.label}>Job Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Leaking pipe under kitchen sink"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Detailed Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Please describe the issue in detail. When did it start? Is it an emergency?"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Attach Photos</Text>
            <Text style={styles.photoCount}>Max 3 photos</Text>
          </View>
          <View style={styles.photosRow}>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.thumbImg} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Urgency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency & Timing</Text>
          <View style={styles.urgencyRow}>
            <TouchableOpacity
              style={[styles.urgencyBtn, urgency === 'emergency' && styles.urgencyBtnActive]}
              onPress={() => setUrgency('emergency')}
            >
              <Text style={[styles.urgencyText, urgency === 'emergency' && { color: '#fff' }]}>
                ⚡ Emergency
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.urgencyBtn, urgency === 'flexible' && styles.urgencyBtnActive]}
              onPress={() => setUrgency('flexible')}
            >
              <Text style={[styles.urgencyText, urgency === 'flexible' && { color: '#fff' }]}>
                📅 Flexible
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Pricing */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Call-out Fee (Estimated)</Text>
            <Text style={styles.feeValue}>£{tradesman.call_out_fee || 50}.00</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Hourly Rate</Text>
            <Text style={styles.feeValue}>£{tradesman.hourly_rate?.toFixed(2)}/hr</Text>
          </View>
          <View style={styles.feeNote}>
            <Text style={styles.feeNoteIcon}>ℹ</Text>
            <Text style={styles.feeNoteText}>
              Final price will be determined after inspection. You will not be charged until the job is accepted and completed.
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Send Request ✈</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 100 },
  tradesmanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#E8781A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tradesmanName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  tradesmanTrade: { fontSize: 13, color: '#E8781A', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', marginTop: 2 },
  rating: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  jobs: { fontSize: 13, color: '#6B7280' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#111827',
  },
  textarea: { height: 100, paddingTop: 12 },
  photosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  photoCount: { fontSize: 12, color: '#9CA3AF' },
  photosRow: { flexDirection: 'row', gap: 10 },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8781A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E8',
  },
  addPhotoIcon: { fontSize: 22 },
  addPhotoText: { fontSize: 11, color: '#E8781A', fontWeight: '600', marginTop: 2 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  urgencyRow: { flexDirection: 'row', gap: 10 },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  urgencyBtnActive: { backgroundColor: '#E8781A', borderColor: '#E8781A' },
  urgencyText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  feeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  feeLabel: { fontSize: 14, color: '#374151' },
  feeValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  feeNote: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' },
  feeNoteIcon: { color: '#E8781A', fontSize: 14, marginRight: 6, marginTop: 1 },
  feeNoteText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  submitBtn: {
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
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
