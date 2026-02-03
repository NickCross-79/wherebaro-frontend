import React, { useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

export default function ItemMarketTab({
  item,
  bottomSpacer,
  styles,
  marketData,
  isLoadingMarket,
}) {
  const screenWidth = Dimensions.get('window').width;
  const [selectedModRank, setSelectedModRank] = useState(0);

  // Get unique mod ranks from data
  const getAvailableModRanks = () => {
    if (!marketData || !marketData.data) return [];
    const ranks = new Set(marketData.data.map(d => d.mod_rank).filter(r => r !== undefined));
    return Array.from(ranks).sort((a, b) => a - b);
  };

  const isMod = item?.type && item.type.toLowerCase().includes('mod');
  const availableModRanks = isMod ? getAvailableModRanks() : [];

  // Process market data for the chart
  const getChartData = () => {
    if (!marketData || !marketData.data || marketData.data.length === 0) {
      return null;
    }

    // Sort by datetime and take last 30 days
    let sortedData = [...marketData.data].sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    ).slice(-30);

    // If item is a mod, filter by selected mod_rank
    if (isMod) {
      sortedData = sortedData.filter(d => d.mod_rank === selectedModRank);
    }

    if (sortedData.length === 0) {
      return null;
    }

    // Extract prices and dates
    const prices = sortedData.map(d => d.avg_price);
    const dates = sortedData.map(d => {
      const date = new Date(d.datetime);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Show labels for every 6th day to avoid clutter (spread across 30 days)
    const labels = dates.map((date, index) => 
      index % 6 === 0 ? date : ''
    );

    return {
      labels,
      datasets: [
        {
          data: prices,
          color: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = getChartData();

  // Get latest average price
  const getLatestPrice = () => {
    if (!marketData || !marketData.data) return null;
    
    let filteredData = [...marketData.data].sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    );

    if (isMod) {
      filteredData = filteredData.filter(d => d.mod_rank === selectedModRank);
    }

    if (filteredData.length === 0) return null;
    return filteredData[filteredData.length - 1].avg_price;
  };

  const latestPrice = getLatestPrice();

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
        
        {isMod && availableModRanks.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>Mod Rank</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {availableModRanks.map((rank) => (
                <TouchableOpacity
                  key={rank}
                  style={[
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#D4A574',
                    },
                    selectedModRank === rank && { backgroundColor: '#D4A574' }
                  ]}
                  onPress={() => setSelectedModRank(rank)}
                >
                  <Text
                    style={[
                      { color: '#D4A574', fontWeight: '600' },
                      selectedModRank === rank && { color: '#1a1a1a' }
                    ]}
                  >
                    Rank {rank}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {isLoadingMarket ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#D4A574" />
            <Text style={[styles.noDataText, { marginTop: 12 }]}>Loading market data...</Text>
          </View>
        ) : chartData ? (
          <View>
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
                paddingLeft: 0,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '2',
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
            {latestPrice && (
              <Text style={[styles.noDataText, { marginTop: 12, textAlign: 'center', fontSize: 16 }]}>
                Latest Average Price: <Text style={{ fontWeight: '700', color: '#D4A574' }}>{Math.round(latestPrice)}</Text>
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>No market data available for this item</Text>
        )}
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
