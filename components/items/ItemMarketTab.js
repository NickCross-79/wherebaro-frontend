import React, { useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
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
  const maxChartWidth = 420;
  const chartWidth = Math.min(screenWidth, maxChartWidth);
  const [selectedModRank, setSelectedModRank] = useState(0);
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [isSubtypeDropdownOpen, setIsSubtypeDropdownOpen] = useState(false);
  const sectionStyle = { marginBottom: 20 };

  // Get unique mod ranks from statistics_closed 90days
  const getAvailableModRanks = () => {
    const arr = marketData?.statistics_closed?.['90days'] || [];
    const ranks = new Set(arr.map(d => d.mod_rank).filter(r => r !== undefined));
    return Array.from(ranks).sort((a, b) => a - b);
  };

  const isMod = item?.type && item.type.toLowerCase().includes('mod');
  const availableModRanks = isMod ? getAvailableModRanks() : [];
  const maxModRank = availableModRanks.length > 0
    ? availableModRanks[availableModRanks.length - 1]
    : null;
  const selectedRankLabel = selectedModRank === maxModRank
    ? 'Max'
    : `Rank ${selectedModRank}`;

  // Get unique subtypes from statistics_closed 90days (for Void Relics)
  const getAvailableSubtypes = () => {
    const arr = marketData?.statistics_closed?.['90days'] || [];
    const subtypes = new Set(arr.map(d => d.subtype).filter(s => s !== undefined && s !== ''));
    return Array.from(subtypes).sort();
  };

  const isVoidRelic = item?.type && item.type.toLowerCase().includes('void relic');
  const availableSubtypes = isVoidRelic ? getAvailableSubtypes() : [];
  
  // Set default subtype to first available if not set
  React.useEffect(() => {
    if (isVoidRelic && availableSubtypes.length > 0 && !selectedSubtype) {
      setSelectedSubtype(availableSubtypes[0]);
    }
  }, [isVoidRelic, availableSubtypes, selectedSubtype]);

  // Chart data from statistics_closed 90days
  const getChartData = () => {
    const arr = marketData?.statistics_closed?.['90days'] || [];
    if (!arr.length) return null;

    // Only keep points at 00:00 (midnight UTC) each day, for the full 90 days
    let filtered = arr.filter(d => {
      const date = new Date(d.datetime);
      return date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
    });

    // If item is a mod, filter by selected mod_rank
    if (isMod) {
      filtered = filtered.filter(d => d.mod_rank === selectedModRank);
    }
    // If item is a void relic, filter by selected subtype
    if (isVoidRelic && selectedSubtype) {
      filtered = filtered.filter(d => d.subtype === selectedSubtype);
    }
    if (!filtered.length) return null;

    // Sort by datetime ascending
    filtered = filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    // Use every data point
    const prices = filtered.map(d => d.avg_price);
    const dates = filtered.map(d => {
      const date = new Date(d.datetime);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    // Show labels for every 5th day to avoid clutter
    const labels = dates.map((date, index) => index % 5 === 0 ? date : '');
    // Log the latest and second latest data points if available
    if (filtered.length > 0) {
      console.log('[MarketTab] Latest data point:', filtered[filtered.length - 1]);
    }
    if (filtered.length > 1) {
      console.log('[MarketTab] Second latest data point:', filtered[filtered.length - 2]);
    }
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

  // Get latest average price (from statistics_closed 90days)
  const getLatestPrice = () => {
    const arr = marketData?.statistics_closed?.['90days'] || [];
    if (!arr.length) return null;
    let filtered = arr.filter(d => {
      const date = new Date(d.datetime);
      return date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
    });
    if (isMod) {
      filtered = filtered.filter(d => d.mod_rank === selectedModRank);
    }
    if (isVoidRelic && selectedSubtype) {
      filtered = filtered.filter(d => d.subtype === selectedSubtype);
    }
    if (!filtered.length) return null;
    // Sort by datetime descending to get the latest
    filtered = filtered.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    return filtered[0]?.avg_price ?? null;
  };
  const latestPrice = getLatestPrice();
  const hasRecentMarketData = Boolean(chartData);

  const handleOpenLink = () => {
    if (item?.link) {
      Linking.openURL(item.link);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomSpacer, paddingHorizontal: 16, paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={sectionStyle}>
        <Text style={styles.sectionTitle}>Price History (30 Days)</Text>
        
        {isLoadingMarket ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#D4A574" />
            <Text style={[styles.noDataText, { marginTop: 12 }]}>Loading market data...</Text>
          </View>
        ) : chartData ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <LineChart
              data={chartData}
              width={chartWidth}
              height={220}
              withHorizontalLines={false}
              withVerticalLines={false}
              withDots={false}
              chartConfig={{
                backgroundGradientFrom: '#0A0E1A',
                backgroundGradientTo: '#0A0E1A',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`,
                fillShadowGradientFrom: '#D4A574',
                fillShadowGradientTo: '#D4A574',
                fillShadowGradientFromOpacity: 0.3,
                fillShadowGradientToOpacity: 0.05,
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
                marginTop: 8,
                marginBottom: 4,
                borderRadius: 16,
                backgroundColor: 'transparent',
              }}
            />
            {isMod && availableModRanks.length > 0 && (
              <View style={{ marginTop: 16, width: '100%' }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#D4A574',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setIsRankDropdownOpen(!isRankDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#D4A574', fontWeight: '600', flex: 1, textAlign: 'center', fontSize: 16 }}>
                    {selectedRankLabel}
                  </Text>
                  <Ionicons
                    name={isRankDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#D4A574"
                  />
                </TouchableOpacity>

                {isRankDropdownOpen && (
                  <View
                    style={{
                      marginTop: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#2C3545',
                      overflow: 'hidden',
                      backgroundColor: '#10151C',
                    }}
                  >
                    {availableModRanks.map((rank, index) => (
                      <TouchableOpacity
                        key={rank}
                        onPress={() => {
                          setSelectedModRank(rank);
                          setIsRankDropdownOpen(false);
                        }}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: '#1C2430',
                          backgroundColor: selectedModRank === rank ? '#D4A574' : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: selectedModRank === rank ? '#1a1a1a' : '#D4A574',
                            fontWeight: '600',
                            textAlign: 'center',
                            fontSize: 16,
                          }}
                        >
                          {rank === maxModRank ? 'Max' : `Rank ${rank}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Subtype Selector for Void Relics */}
            {isVoidRelic && availableSubtypes.length > 0 && (
              <View style={{ marginTop: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={() => setIsSubtypeDropdownOpen(!isSubtypeDropdownOpen)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#2C3545',
                    backgroundColor: '#10151C',
                  }}
                >
                  <Text
                    style={{
                      color: '#D4A574',
                      fontWeight: '600',
                      fontSize: 16,
                      marginRight: 8,
                    }}
                  >
                    {formatSubtypeLabel(selectedSubtype)}
                  </Text>
                  <Ionicons
                    name={isSubtypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#D4A574"
                  />
                </TouchableOpacity>

                {isSubtypeDropdownOpen && (
                  <View
                    style={{
                      marginTop: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#2C3545',
                      overflow: 'hidden',
                      backgroundColor: '#10151C',
                    }}
                  >
                    {availableSubtypes.map((subtype, index) => (
                      <TouchableOpacity
                        key={subtype}
                        onPress={() => {
                          setSelectedSubtype(subtype);
                          setIsSubtypeDropdownOpen(false);
                        }}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: '#1C2430',
                          backgroundColor: selectedSubtype === subtype ? '#D4A574' : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: selectedSubtype === subtype ? '#1a1a1a' : '#D4A574',
                            fontWeight: '600',
                            textAlign: 'center',
                            fontSize: 16,
                          }}
                        >
                          {formatSubtypeLabel(subtype)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>No market data available for this item</Text>
        )}
      </View>

      <View style={sectionStyle}>
        <Text style={styles.sectionTitle}>Market Information</Text>

        {latestPrice && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginTop: 12,
            marginBottom: 12,
          }}>
            <Text style={{
              color: '#8B9CB6',
              fontSize: 16,
            }}>
              Average Price
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                color: '#E8E8E8',
                fontSize: 18,
                fontWeight: '600',
                marginRight: 6,
              }}>
                {Math.round(latestPrice)}
              </Text>
              <Image
                source={require('../../assets/imgs/img_platinum.png')}
                style={{ width: 18, height: 18 }}
              />
            </View>
          </View>
        )}
        
        {item?.link ? (
          <TouchableOpacity 
            style={styles.marketLink}
            onPress={handleOpenLink}
          >
            <Ionicons name="open-outline" size={20} color="#D4A574" />
            <Text style={styles.marketLinkText}>View on Warframe Wiki</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A574" />
          </TouchableOpacity>
        ) : !hasRecentMarketData ? (
          <Text style={styles.noDataText}>No market information available</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
