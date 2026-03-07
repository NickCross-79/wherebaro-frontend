import React from 'react';
import { ScrollView, View, Text, Image, ImageBackground, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PERMANENT_BARO_ITEMS } from '../../constants/items';
import { colors, gradients } from '../../constants/theme';

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
}) {
  const offeringDates = item.offeringDates || [];
  const isPermanentItem = PERMANENT_BARO_ITEMS.includes(item.name?.toLowerCase());

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
            source={item.image && item.image !== 'temp:modImage' && !item.image.endsWith('/temp:modImage') ? { uri: item.image } : require('../../assets/imgs/background_newItem.png')}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      {/* Item Name and Type */}
      <View style={styles.infoSection}>
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
              source={require('../../assets/imgs/img_credit.png')}
              style={styles.creditIcon}
            />
            <Text style={styles.priceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditValue}>
            {item.creditPrice != null ? item.creditPrice.toLocaleString() : 'N/A'}
          </Text>
        </View>
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
      </View>

      {/* Buy or Skip Vote Section — only for current Baro inventory */}
      {isInCurrentInventory && voteData && (
        <View style={voteStyles.container}>
          <Text style={voteStyles.title}>Buy or Skip?</Text>
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
                Buy ({voteData.buyCount})
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
                Skip ({voteData.skipCount})
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
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 12,
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
});
