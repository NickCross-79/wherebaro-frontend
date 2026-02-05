import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailTabs({ activeTab, setActiveTab, styles, item }) {
  // Show market tab only for Mod, Weapon, and Void Relic items, excluding Ignis Wraith
  const showMarketTab = item && ['Mod', 'Weapon', 'Void Relic'].some(
    category => item.type.toLowerCase().startsWith(category.toLowerCase())
  ) && item.name !== 'Ignis Wraith';
  return (
    <View style={styles.tabNav}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'details' && styles.tabActive]}
        onPress={() => setActiveTab('details')}
      >
        <Ionicons
          name="information-circle"
          size={20}
          color={activeTab === 'details' ? '#D4A574' : '#8B9DC3'}
        />
        <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
          Details
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
        onPress={() => setActiveTab('reviews')}
      >
        <Ionicons
          name="chatbubbles"
          size={20}
          color={activeTab === 'reviews' ? '#D4A574' : '#8B9DC3'}
        />
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
          Reviews
        </Text>
      </TouchableOpacity>
      {showMarketTab && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'market' && styles.tabActive]}
          onPress={() => setActiveTab('market')}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={activeTab === 'market' ? '#D4A574' : '#8B9DC3'}
          />
          <Text style={[styles.tabText, activeTab === 'market' && styles.tabTextActive]}>
            Market
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
