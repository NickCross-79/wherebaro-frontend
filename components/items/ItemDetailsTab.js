import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, Image, ImageBackground, TouchableOpacity, Modal, Pressable, Linking, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PERMANENT_BARO_ITEMS, MARK_OWNED_EXCLUDED_ITEMS } from '../../constants/items';
import { colors, gradients } from '../../constants/theme';
import { storageHelpers } from '../../utils/storage';
import { useUserActions } from '../../contexts/UserActionsContext';

export default function ItemDetailsTab({
  item,
  bottomSpacer,
  showOfferings,
  setShowOfferings,
  formatDate,
  lastBrought,
  styles,
  isInCurrentInventory,
  voteData,
  onToggleWishlist,
  isWishlisted,
}) {
  const offeringDates = item.offeringDates || [];
  const isPermanentItem = PERMANENT_BARO_ITEMS.includes(item.name?.toLowerCase());
  const [voteInfoVisible, setVoteInfoVisible] = useState(false);
  const [barMounted, setBarMounted] = useState(false);
  const { isOwned, markOwned } = useUserActions();
  const itemId = String(item._id?.$oid || item._id || item.id);
  const owned = isOwned(itemId);
  const [useCdnFallback, setUseCdnFallback] = useState(false);
  useEffect(() => setUseCdnFallback(false), [item?.wikiImageLink]);

  // Show the voting intro modal the first time the user opens a Baro inventory item each visit
  useEffect(() => {
    if (!isInCurrentInventory || !voteData) return;
    Promise.all([
      storageHelpers.get('vote_intro_visit'),
      storageHelpers.getBaroResponse(),
    ]).then(([seenVisit, baroResponse]) => {
      const currentVisit = baroResponse?.activation ?? null;
      if (currentVisit && seenVisit !== currentVisit) {
        setVoteInfoVisible(true);
        storageHelpers.set('vote_intro_visit', currentVisit);
      }
    });
  }, []);

  // Vote bar animation
  const barProgress = useRef(new Animated.Value(0)).current;
  const barVisible = useRef(new Animated.Value(0)).current;
  const prevVoteTotal = useRef(null);
  const voteTotal = (voteData?.buyCount ?? 0) + (voteData?.skipCount ?? 0);
  const buyPct = voteTotal > 0 ? voteData.buyCount / voteTotal : 0;
  const skipPct = voteTotal > 0 ? 1 - buyPct : 0;

  useEffect(() => {
    if (!isInCurrentInventory || !voteData) return;

    const prevTotal = prevVoteTotal.current;
    const wasZero = prevTotal === 0 || prevTotal === null;
    prevVoteTotal.current = voteTotal;

    if (voteTotal > 0 && wasZero) {
      // Mount — entrance animation fires in the effect below after re-render
      barVisible.setValue(0);
      barProgress.setValue(0);
      setBarMounted(true);
    } else if (voteTotal === 0 && prevTotal > 0) {
      // Last vote removed — animate out then unmount
      Animated.timing(barVisible, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setBarMounted(false));
    } else if (voteTotal > 0 && !wasZero) {
      // Vote changed — re-fill the bar
      barProgress.setValue(0);
      Animated.timing(barProgress, {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }
  }, [voteTotal, isInCurrentInventory]);

  // Entrance animation — runs after barMounted=true causes re-render
  useEffect(() => {
    if (!barMounted || voteTotal === 0) return;
    Animated.sequence([
      Animated.timing(barVisible, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(barProgress, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [barMounted]);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: bottomSpacer }}
      showsVerticalScrollIndicator={false}
    >
      {/* Item Image with Background */}
      <ImageBackground
        source={require('../../assets/imgs/background_newItem.png')}
        style={styles.imageBackgroundContainer}
        imageStyle={styles.imageBackgroundImage}
        resizeMode="cover"
        blurRadius={4}
      >
        <LinearGradient
          colors={gradients.imageOverlay}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
        <View style={styles.imageContainer}>
          <Image
            source={item.wikiImageLink && item.wikiImageLink !== 'temp:modImage' && !item.wikiImageLink.endsWith('/temp:modImage') ? { uri: useCdnFallback ? item.cdnImageLink : item.wikiImageLink } : require('../../assets/imgs/background_newItem.png')}
            style={styles.itemImage}
            resizeMode="contain"
            onError={() => { if (!useCdnFallback && item.cdnImageLink) setUseCdnFallback(true); }}
          />
        </View>
      </ImageBackground>

      {/* Item Name and Type */}
      <View style={styles.infoSection}>
        {isInCurrentInventory && voteData && (() => {
          const buyCount = voteData.buyCount ?? 0;
          const skipCount = voteData.skipCount ?? 0;
          if (buyCount === 0 && skipCount === 0) return null;
          const total = buyCount + skipCount;
          const winner = buyCount >= skipCount ? 'buy' : 'skip';
          const winnerCount = winner === 'buy' ? buyCount : skipCount;
          const pct = Math.round((winnerCount / total) * 100);
          return (
            <View style={voteStyles.detailBadge}>
              <Ionicons
                name={winner === 'buy' ? 'cart' : 'close-circle'}
                size={12}
                color={winner === 'buy' ? colors.accent : colors.danger}
              />
              <Text style={[voteStyles.detailBadgeText, winner === 'buy' ? voteStyles.detailBadgeTextBuy : voteStyles.detailBadgeTextSkip]}>
                {pct}% voted to {winner === 'buy' ? 'Buy' : 'Skip'}
              </Text>
            </View>
          );
        })()}
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.categoryText}>{item.type}</Text>
        {item.link ? (
          <TouchableOpacity
            style={styles.wikiLinkContainer}
            onPress={() => Linking.openURL(`https://wiki.warframe.com/w/${item.link}`)}
          >
            <Ionicons name="open-outline" size={16} color={colors.link} />
            <Text style={styles.wikiLinkText}>View on Wiki</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Prices */}
      <View style={styles.pricesContainer}>
        <View style={styles.priceBox}>
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../../assets/imgs/img_ducat.png')}
              style={styles.ducatIcon}
            />
            <Text style={styles.priceLabel}>Ducats</Text>
          </View>
          <Text style={styles.ducatValue}>
            {(item.ducatPrice ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../../assets/imgs/img_credit.png')}
              style={styles.creditIcon}
            />
            <Text style={styles.priceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditValue}>
            {item.creditPrice != null ? item.creditPrice.toLocaleString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Wishlist + Mark as Owned */}
      <View style={actionRowStyles.row}>
        <TouchableOpacity
          style={[actionRowStyles.button, actionRowStyles.buttonWishlist, isWishlisted && actionRowStyles.buttonWishlisted]}
          onPress={onToggleWishlist}
          activeOpacity={0.8}
        >
          <View style={actionRowStyles.buttonTouchable}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? colors.textOnAccent : '#00C8D7'}
            />
            <Text style={[actionRowStyles.buttonText, actionRowStyles.buttonTextWishlist, isWishlisted && actionRowStyles.buttonTextWishlisted]}>
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Text>
          </View>
        </TouchableOpacity>

        {!MARK_OWNED_EXCLUDED_ITEMS.includes(item.name?.toLowerCase()) && (
          <TouchableOpacity
            style={[actionRowStyles.button, owned && actionRowStyles.buttonOwned]}
            onPress={() => markOwned(itemId, !owned)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: owned }}
            accessibilityLabel={owned ? 'Owned — tap to unmark' : 'Mark as owned'}
          >
            <View style={actionRowStyles.buttonTouchable}>
              <Ionicons
                name={owned ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={owned ? colors.textOnAccent : colors.accent}
              />
              <Text style={[actionRowStyles.buttonText, owned && actionRowStyles.buttonTextOwned]}>
                {owned ? 'Owned' : 'Mark as Owned'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Buy or Skip Vote Section — only for current Baro inventory */}
      {isInCurrentInventory && voteData && (
        <View style={voteStyles.container}>
          <Modal
            transparent
            animationType="fade"
            visible={voteInfoVisible}
            onRequestClose={() => setVoteInfoVisible(false)}
          >
            <Pressable style={voteStyles.modalOverlay} onPress={() => setVoteInfoVisible(false)}>
              <Pressable style={voteStyles.modalBox} onPress={() => {}}>
                <Text style={voteStyles.modalTitle}>How Voting Works</Text>
                <Text style={voteStyles.modalBody}>
                  {`Vote whether users should buy this item, or save their Ducats.\n\nThe community's results are shown as a badge on the item card. The winning side and its total votes are displayed so you can see what other players think at a glance.\n\nVotes are cleared after each Baro visit, so every visit is a fresh poll.`}
                </Text>
                <TouchableOpacity style={voteStyles.modalClose} onPress={() => setVoteInfoVisible(false)}>
                  <Text style={voteStyles.modalCloseText}>Got it</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          <View style={voteStyles.titleRow}>
            <Text style={voteStyles.title}>Buy or Skip?</Text>
            <TouchableOpacity onPress={() => setVoteInfoVisible(true)} hitSlop={8}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Split vote bar */}
          {barMounted && (
            <Animated.View style={[
              voteStyles.splitBarWrapper,
              {
                opacity: barVisible,
                maxHeight: barVisible.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
                marginBottom: barVisible.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
              },
            ]}>
              <View style={voteStyles.splitBarTrack}>
                {buyPct > 0 && (
                  <Animated.View style={[voteStyles.splitBarBuy, { flex: barProgress.interpolate({ inputRange: [0, 1], outputRange: [0, buyPct] }) }]} />
                )}
                {skipPct > 0 && (
                  <Animated.View style={[voteStyles.splitBarSkip, { flex: barProgress.interpolate({ inputRange: [0, 1], outputRange: [0, skipPct] }) }]} />
                )}
              </View>
              <View style={voteStyles.splitBarLabels}>
                <Text style={voteStyles.splitLabelBuy}>{Math.round(buyPct * 100)}% Buy ({voteData.buyCount})</Text>
                <Text style={voteStyles.splitLabelSkip}>{Math.round(skipPct * 100)}% Skip ({voteData.skipCount})</Text>
              </View>
            </Animated.View>
          )}

          <View style={voteStyles.buttonRow}>
            <TouchableOpacity
              style={[
                voteStyles.button,
                voteData.userVote === 'buy' && voteStyles.buttonActiveBuy,
              ]}
              onPress={() => voteData.handleVote('buy')}
              disabled={voteData.isVoting}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cart"
                size={20}
                color={voteData.userVote === 'buy' ? colors.textOnAccent : colors.accent}
              />
              <Text
                style={[
                  voteStyles.buttonText,
                  voteData.userVote === 'buy' && voteStyles.buttonTextActive,
                ]}
              >
                Buy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                voteStyles.button,
                voteData.userVote === 'skip' && voteStyles.buttonActiveSkip,
              ]}
              onPress={() => voteData.handleVote('skip')}
              disabled={voteData.isVoting}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={voteData.userVote === 'skip' ? '#fff' : colors.textSecondary}
              />
              <Text
                style={[
                  voteStyles.buttonText,
                  voteData.userVote === 'skip' && voteStyles.buttonTextActiveSkip,
                ]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Last Brought Date */}
      {!isPermanentItem && (
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Last Brought</Text>
        <Text style={styles.dateValue}>{lastBrought ? formatDate(lastBrought) : 'Never'}</Text>
      </View>
      )}

      {/* Offering Dates Dropdown */}
      {!isPermanentItem && (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setShowOfferings(!showOfferings)}
        >
          <Text style={styles.dropdownTitle}>Offering Dates</Text>
          <View style={styles.dropdownMeta}>
            <Text style={styles.dropdownCount}>{offeringDates.length}</Text>
            <Ionicons
              name={showOfferings ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.accent}
            />
          </View>
        </TouchableOpacity>

        {showOfferings && (
          <View style={styles.dropdownList}>
            {offeringDates.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No offering dates available</Text>
            ) : (
              offeringDates.map((date, index) => (
                <View key={`${date}-${index}`} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{formatDate(date)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
      )}
    </ScrollView>
  );
}

const actionRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    overflow: 'hidden',
  },
  buttonWishlist: {
    borderColor: '#00C8D7',
  },
  buttonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  buttonOwned: {
    backgroundColor: colors.accent,
  },
  buttonWishlisted: {
    backgroundColor: '#00C8D7',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  buttonTextWishlist: {
    color: '#00C8D7',
  },
  buttonTextOwned: {
    color: colors.textOnAccent,
  },
  buttonTextWishlisted: {
    color: colors.textOnAccent,
  },
});

const voteStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalClose: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseText: {
    color: colors.textOnAccent,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    gap: 8,
  },
  buttonActiveBuy: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  buttonActiveSkip: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  buttonTextActive: {
    color: colors.textOnAccent,
  },
  buttonTextActiveSkip: {
    color: '#fff',
  },
  splitBarWrapper: {
    overflow: 'hidden',
  },
  splitBarTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitBarBuy: {
    backgroundColor: colors.accent,
    opacity: 0.85,
  },
  splitBarSkip: {
    backgroundColor: colors.danger,
    opacity: 0.75,
  },
  splitBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  splitLabelBuy: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    opacity: 0.8,
  },
  splitLabelSkip: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.danger,
    opacity: 0.8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detailBadgeTextBuy: {
    color: colors.accent,
  },
  detailBadgeTextSkip: {
    color: colors.danger,
  },
});
