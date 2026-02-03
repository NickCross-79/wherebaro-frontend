import React from 'react';
import { ScrollView, View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ItemDetailsTab({
  item,
  bottomSpacer,
  showOfferings,
  setShowOfferings,
  formatDate,
  lastBrought,
  styles,
}) {
  const offeringDates = item.offeringDates || [];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: bottomSpacer }}
      showsVerticalScrollIndicator={false}
    >
      {/* Item Image with Background */}
      <ImageBackground
        source={require('../../assets/background_newItem.png')}
        style={styles.imageBackgroundContainer}
        imageStyle={styles.imageBackgroundImage}
        resizeMode="cover"
        blurRadius={4}
      >
        <LinearGradient
          colors={['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.15)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      {/* Item Name and Type */}
      <View style={styles.infoSection}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.categoryText}>{item.type}</Text>
      </View>

      {/* Prices */}
      <View style={styles.pricesContainer}>
        <View style={styles.priceBox}>
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../../assets/imgs/icons/img_credit.png')}
              style={styles.creditIcon}
            />
            <Text style={styles.priceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditValue}>
            {item.creditPrice?.toLocaleString() || 'N/A'}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../../assets/imgs/icons/img_ducat.png')}
              style={styles.ducatIcon}
            />
            <Text style={styles.priceLabel}>Ducats</Text>
          </View>
          <Text style={styles.ducatValue}>
            {item.ducatPrice || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Last Brought Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Last Brought</Text>
        <Text style={styles.dateValue}>{formatDate(lastBrought)}</Text>
      </View>

      {/* Offering Dates Dropdown */}
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
              color="#D4A574"
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
    </ScrollView>
  );
}
