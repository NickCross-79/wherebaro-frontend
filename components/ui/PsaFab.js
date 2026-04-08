import { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, Modal, Text, View, Animated, Easing, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPsa } from '../../services/psaService';
import { colors } from '../../constants/theme';
import styles from '../../styles/components/ui/PsaFab.styles';
import logger from '../../utils/logger';

export default function PsaFab() {
  const [psas, setPsas] = useState([]);
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    const loadPsa = async () => {
      try {
        const data = await fetchPsa();
        if (!cancelled) setPsas(data);
      } catch (e) {
        logger.debug('PsaFab', `Failed to fetch PSA: ${e}`);
      }
    };

    loadPsa();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (psas.length === 0) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [psas, pulseAnim]);

  const handleOpen = useCallback(() => { setIndex(0); setModalVisible(true); }, []);
  const handleClose = useCallback(() => setModalVisible(false), []);
  const handlePrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(() => setIndex((i) => Math.min(psas.length - 1, i + 1)), [psas.length]);

  if (psas.length === 0) return null;

  const psa = psas[index];

  return (
    <>
      <Animated.View style={[styles.fab, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={handleOpen} activeOpacity={0.8} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Image source={require('../../assets/imgs/img_baro_psa.png')} style={{ width: 52, height: 52, borderRadius: 26, resizeMode: 'cover' }} />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>{psa.title || 'Announcement'}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.message}>{psa.message}</Text>
            <View style={styles.footer}>
              {psas.length > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity onPress={handlePrev} disabled={index === 0} style={styles.pageButton}>
                    <Ionicons name="chevron-back" size={18} color={index === 0 ? colors.textDim : colors.textMuted} />
                  </TouchableOpacity>
                  <Text style={styles.pageIndicator}>{index + 1} / {psas.length}</Text>
                  <TouchableOpacity onPress={handleNext} disabled={index === psas.length - 1} style={styles.pageButton}>
                    <Ionicons name="chevron-forward" size={18} color={index === psas.length - 1 ? colors.textDim : colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
              {psa.createdAt && (
                <Text style={styles.date}>{new Date(psa.createdAt).toLocaleDateString()}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.gotItButton} activeOpacity={0.8}>
              <Text style={styles.gotItText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
