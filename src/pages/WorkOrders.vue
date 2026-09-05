import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { technicianApi } from '../api/technicianApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// 1. KOMPONEN SKELETON ANIMATED PLACEHOLDER
// =============================================================================
const SkeletonItem = ({ width, height, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 16,
          backgroundColor: '#cbd5e1',
          borderRadius: 6,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

// Render Skeleton Layout khusus tampilan mobile
const renderSkeletonScreen = () => (
  <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    {/* Header Skeleton */}
    <View style={styles.headerRow}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <SkeletonItem width="75%" height={24} style={{ marginBottom: 6 }} />
        <SkeletonItem width="45%" height={14} />
      </View>
      <SkeletonItem width={100} height={28} style={{ borderRadius: 14 }} />
    </View>

    {/* Card Skeleton 1 */}
    <View style={styles.card}>
      <SkeletonItem width="50%" height={16} style={{ marginBottom: 12 }} />
      <SkeletonItem width="85%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonItem width="60%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonItem width="40%" height={14} />
    </View>

    {/* Card Skeleton 2 */}
    <View style={styles.card}>
      <SkeletonItem width="60%" height={16} style={{ marginBottom: 12 }} />
      <SkeletonItem width="90%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonItem width="75%" height={14} />
    </View>

    {/* Card Skeleton 3 (Material/Resources) */}
    <View style={styles.card}>
      <SkeletonItem width="40%" height={16} style={{ marginBottom: 12 }} />
      <SkeletonItem width="100%" height={14} style={{ marginBottom: 6 }} />
      <SkeletonItem width="100%" height={14} style={{ marginBottom: 6 }} />
      <SkeletonItem width="50%" height={16} style={{ marginTop: 8 }} />
    </View>

    {/* Action Buttons Skeleton */}
    <View style={{ gap: 10, marginTop: 10, marginBottom: 40 }}>
      <SkeletonItem width="100%" height={48} style={{ borderRadius: 8 }} />
      <SkeletonItem width="100%" height={48} style={{ borderRadius: 8 }} />
    </View>
  </ScrollView>
);

// Helper pemetaan style Status Badge
const getStatusBadgeConfig = (status) => {
  switch (status) {
    case 'ASSIGNED':
      return { label: 'ASSIGNED', bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
    case 'ACCEPTED':
      return { label: 'ACCEPTED', bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    case 'IN_PROGRESS':
      return { label: 'IN PROGRESS', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' };
    case 'COMPLETED':
      return { label: 'COMPLETED', bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    case 'CANCELLED':
      return { label: 'CANCELLED', bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
    default:
      return { label: status || 'UNKNOWN', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
};

// =============================================================================
// 2. KOMPONEN UTAMA MISSION DETAIL SCREEN
// =============================================================================
export const MissionDetailScreen = ({ route, navigation }) => {
  const workOrderId =
    route.params?.workOrderId ||
    route.params?.id ||
    route.params?.job?._id ||
    route.params?.job?.id;

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!workOrderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await technicianApi.getAssignedJobs(1, 50);
      const jobList = Array.isArray(res?.data) ? res.data : [];
      const found = jobList.find(
        (item) => String(item?._id || item?.id) === String(workOrderId)
      );
      setMission(found || null);
    } catch (err) {
      Alert.alert('Error', 'Gagal mengambil detail misi.');
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  // Handler penyelesaian tugas dengan validasi 3 foto
  const handleCompleteTask = async () => {
    const targetId = mission?._id || mission?.id || workOrderId;
    const photoCount = Array.isArray(mission?.progressImages)
      ? mission.progressImages.length
      : 0;

    if (photoCount < 3) {
      Alert.alert(
        '⚠️ Bukti Perbaikan Belum Lengkap',
        `Anda baru mengunggah ${photoCount} dari minimal 3 foto bukti perbaikan. Silakan lengkapi foto terlebih dahulu.`,
        [
          { text: 'Nanti', style: 'cancel' },
          {
            text: 'Upload Foto Sekarang',
            onPress: () =>
              navigation.navigate('ProgressUpload', { workOrderId: targetId })
          }
        ]
      );
      return;
    }

    try {
      setUpdating(true);
      await technicianApi.updateJobStatus(targetId, 'COMPLETED');
      Alert.alert('🎉 Misi Selesai', 'Tugas berhasil diselesaikan!');
      fetchDetail();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Gagal menyelesaikan tugas.'
      );
    } finally {
      setUpdating(false);
    }
  };

  // Tampilkan Skeleton saat loading
  if (loading) {
    return renderSkeletonScreen();
  }

  if (!mission) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Misi tidak ditemukan.</Text>
      </View>
    );
  }

  const report =
    typeof mission.reportId === 'object' && mission.reportId !== null
      ? mission.reportId
      : null;

  const targetWorkOrderId = mission?._id || mission?.id || workOrderId;
  const photoCount = Array.isArray(mission?.progressImages)
    ? mission.progressImages.length
    : 0;

  const statusBadge = getStatusBadgeConfig(mission.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Info & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.headerMain}>
          <Text style={styles.woCode} numberOfLines={1}>
            {String(mission.woCode || 'WO-UNTITLED')}
          </Text>
          <Text style={styles.company}>
            {String(mission.companyName || 'Infrastructure_Report')}
          </Text>
        </View>

        {/* Display Status Badge */}
        <View
          style={[
            styles.badgeContainer,
            {
              backgroundColor: statusBadge.bg,
              borderColor: statusBadge.border
            }
          ]}
        >
          <Text style={[styles.badgeText, { color: statusBadge.text }]}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      {/* Detail Lokasi & Jadwal */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📍 Lokasi & Jadwal</Text>
        <Text style={styles.text}>
          Tempat: <Text style={styles.textDark}>{String(mission.locationName || '-')}</Text>
        </Text>
        <Text style={styles.text}>
          Eksekusi:{' '}
          <Text style={styles.textDark}>
            {mission.executionDate
              ? new Date(mission.executionDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : '-'}
          </Text>
        </Text>
      </View>

      {/* Section Infrastructure Report */}
      {Boolean(report) && (
        <View style={styles.cardHighlight}>
          <Text style={styles.sectionTitle}>🚨 Laporan Infrastruktur Terkait</Text>
          <Text style={styles.text}>
            Judul: <Text style={styles.textDark}>{String(report.title || report.locationName || '-')}</Text>
          </Text>
          <Text style={styles.text}>
            Kategori: <Text style={styles.textDark}>{String(report.category || '-')}</Text>
          </Text>
          <Text style={styles.text}>
            Deskripsi: <Text style={styles.textDark}>{String(report.description || '-')}</Text>
          </Text>
          <Text style={styles.text}>
            Status Laporan: <Text style={styles.boldBlue}>{String(report.status || '-')}</Text>
          </Text>
        </View>
      )}

      {/* Rincian Material */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🛠️ Rincian Material</Text>
        {(mission.resources || []).length > 0 ? (
          (mission.resources || []).map((res, idx) => (
            <View key={res._id || idx} style={styles.resourceRow}>
              <Text style={styles.subText}>
                • {String(res.name || 'Material')} ({Number(res.quantity || 0)}{' '}
                {String(res.unit || 'pcs')})
              </Text>
              <Text style={styles.subPrice}>
                Rp {Number(res.subtotal || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.subText}>Tidak ada rincian material tambahan.</Text>
        )}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total:</Text>
          <Text style={styles.grandTotal}>
            Rp {Number(mission.grandTotal || 0).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {/* Galeri Foto Progress Terunggah */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          📷 Foto Bukti Perbaikan ({photoCount}/3 Minimal)
        </Text>
        {photoCount > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {mission.progressImages.map((imgUrl, idx) => (
              <Image
                key={idx}
                source={{ uri: imgUrl }}
                style={styles.progressImage}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.warningText}>
            Belum ada foto terunggah. Wajib mengunggah minimal 3 foto bukti perbaikan.
          </Text>
        )}
      </View>

      {/* Tombol Aksi Status & Upload */}
      <View style={styles.actionContainer}>
        {mission.status !== 'COMPLETED' ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={() =>
                navigation.navigate('ProgressUpload', {
                  workOrderId: targetWorkOrderId
                })
              }
            >
              <Text style={styles.btnTextOutline}>
                📷 Upload Foto Bukti ({photoCount}/3)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                photoCount >= 3 ? styles.btnGreen : styles.btnDisabled
              ]}
              onPress={handleCompleteTask}
              disabled={updating}
            >
              <Text style={styles.btnText}>
                {updating ? 'Memproses...' : '✅ Tugas Selesai'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              🎉 Misi Telah Selesai (COMPLETED)
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// =============================================================================
// 3. STYLESHEET RESPONSIVE
// =============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#64748b', fontSize: 14 },
  
  // Header Row & Badge
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8
  },
  headerMain: { flex: 1, minWidth: 180 },
  woCode: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  company: { fontSize: 12, color: '#2563eb', fontWeight: '600', marginTop: 2 },
  
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },

  // Card Layout
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHighlight: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' },
  text: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  textDark: { color: '#1e293b', fontWeight: '500' },
  boldBlue: { fontWeight: 'bold', color: '#2563eb' },
  
  // Resource List & Total
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  subText: { fontSize: 12, color: '#475569', flex: 1 },
  subPrice: { fontSize: 12, color: '#475569', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  grandTotal: { fontSize: 14, fontWeight: 'bold', color: '#10b981' },

  // Galeri & Warning
  warningText: { fontSize: 12, color: '#e11d48', fontStyle: 'italic', marginTop: 4 },
  imageScroll: { flexDirection: 'row', marginTop: 8 },
  progressImage: {
    width: Math.min(100, SCREEN_WIDTH * 0.25),
    height: Math.min(100, SCREEN_WIDTH * 0.25),
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#e2e8f0'
  },

  // Action Buttons
  actionContainer: { gap: 10, marginTop: 8, marginBottom: 40 },
  btn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnGreen: { backgroundColor: '#10b981' },
  btnDisabled: { backgroundColor: '#94a3b8' },
  btnOutline: { borderWidth: 1, borderColor: '#2563eb', backgroundColor: '#ffffff' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  btnTextOutline: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
  completedBadge: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  completedBadgeText: { color: '#15803d', fontWeight: 'bold', fontSize: 14 }
});
