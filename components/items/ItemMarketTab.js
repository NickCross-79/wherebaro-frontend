import React from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

export default function ItemMarketTab({
  item,
  bottomSpacer,
  styles,
}) {
  const screenWidth = Dimensions.get('window').width;

  // Mock price data for the item over the last 30 days
  const generateMockPriceData = (itemId) => {
    const basePrice = Math.floor(Math.random() * 500) + 100;
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * basePrice * 0.3;
      data.push(Math.max(50, basePrice + variance));
    }
    return data;
  };

  const priceData = generateMockPriceData(item.id || item._id);
  
  const chartData = {
    labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    datasets: [
      {
        data: priceData,
        color: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const handleOpenLink = () => {
    if (item?.link) {
      Linking.openURL(item.link);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomSpacer, paddingHorizontal: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price History (30 Days)</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(90, 107, 140, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(90, 107, 140, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '3',
              strokeWidth: '1',
              stroke: '#D4A574',
            },
          }}
          bezier
          style={{
            marginVertical: 12,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Information</Text>
        
        {item?.link ? (
          <TouchableOpacity 
            style={styles.marketLink}
            onPress={handleOpenLink}
          >
            <Ionicons name="open-outline" size={20} color="#D4A574" />
            <Text style={styles.marketLinkText}>View on Warframe Wiki</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A574" />
          </TouchableOpacity>
        ) : (
          <Text style={styles.noDataText}>No market information available</Text>
        )}
      </View>
    </ScrollView>
  );
}
