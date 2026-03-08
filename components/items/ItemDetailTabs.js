import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

export default function ItemDetailTabs({ activeTab, setActiveTab, styles, hasMarketTab }) {
  const showMarketTab = hasMarketTab;
  return (
    <View style={styles.tabNav}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'details' && styles.tabActive]}
        onPress={() => setActiveTab('details')}
      >
        <Ionicons
          name="information-circle"
          size={20}
          color={activeTab === 'details' ? colors.accent : colors.textSecondary}
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
          color={activeTab === 'reviews' ? colors.accent : colors.textSecondary}
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
            color={activeTab === 'market' ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'market' && styles.tabTextActive]}>
            Market
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
