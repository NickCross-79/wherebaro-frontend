import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image, PanResponder } from 'react-native';
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
    : 0;
  
  const [selectedModRank, setSelectedModRank] = useState(maxModRank);
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [isSubtypeDropdownOpen, setIsSubtypeDropdownOpen] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const selectedPointRef = useRef(null);
  const rafRef = useRef(null);
  const chartContainerRef = useRef(null);
  const sectionStyle = { marginBottom: 20 };
  
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

  // Update selected rank when max rank changes (new data loaded)
  React.useEffect(() => {
    if (isMod && maxModRank !== selectedModRank) {
      setSelectedModRank(maxModRank);
    }
  }, [maxModRank, isMod]);

  // Format subtype label for display
  const formatSubtypeLabel = (subtype) => {
    if (!subtype) return '';
    return subtype.charAt(0).toUpperCase() + subtype.slice(1);
  };

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
    // Remove all x-axis labels (no dates)
    const labels = filtered.map(() => '');
    
    return {
      chartData: {
        labels,
        datasets: [
          {
            data: prices,
            color: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      rawData: filtered,
    };
  };

  const chartResult = getChartData();
  const chartData = chartResult?.chartData;
  const rawChartData = chartResult?.rawData || [];

  // react-native-chart-kit internal padding:
  // - Left: 64px for y-axis labels (default yAxisLabel width)
  // - Right: ~16px internal padding
  const CHART_PADDING_LEFT = 64;
  const CHART_PADDING_RIGHT = 16;
  const CHART_AREA_WIDTH = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;

  // Throttled touch handler — batches via rAF to avoid re-rendering every move event
  const handleTouch = useCallback((event) => {
    const locationX = event.locationX;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const dataPointCount = selectedPointRef.current?.dataLength;
      if (!dataPointCount) return;
      const adjustedX = locationX - CHART_PADDING_LEFT;
      // If touch is outside the chart data area, clear selection
      if (adjustedX < -10 || adjustedX > CHART_AREA_WIDTH + 10) {
        setSelectedPointIndex(null);
        return;
      }
      const pointSpacing = CHART_AREA_WIDTH / (dataPointCount - 1);
      const index = Math.round(adjustedX / pointSpacing);
      const clampedIndex = Math.max(0, Math.min(index, dataPointCount - 1));
      setSelectedPointIndex(clampedIndex);
    });
  }, [chartWidth]);

  // Create pan responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent);
      },
      onPanResponderRelease: () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setSelectedPointIndex(null);
      },
    })
  ).current;

  // Keep ref in sync so rAF callback can read data length without stale closure
  React.useEffect(() => {
    selectedPointRef.current = { dataLength: rawChartData.length };
  }, [rawChartData.length]);

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

  // Get market stats for the full 90 days
  const getMarketStats = () => {
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
    
    const prices = filtered.map(d => d.avg_price);
    const volumes = filtered.map(d => d.volume || 0);
    
    return {
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
    };
  };

  const latestPrice = getLatestPrice();
  const marketStats = getMarketStats();

  return (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomSpacer, paddingHorizontal: 16, paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={sectionStyle}>
        <Text style={styles.sectionTitle}>Price History (90 Days)</Text>
        
        {isLoadingMarket ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#D4A574" />
            <Text style={[styles.noDataText, { marginTop: 12 }]}>Loading market data...</Text>
          </View>
        ) : chartData ? (
          <View style={{ width: '100%', alignItems: 'flex-end' }}>
            <View
              ref={chartContainerRef}
              style={{ position: 'relative', width: chartWidth }}
              {...panResponder.panHandlers}
            >
              {selectedPointIndex !== null && rawChartData[selectedPointIndex] && (() => {
                const pointSpacing = CHART_AREA_WIDTH / (rawChartData.length - 1);
                const cursorX = CHART_PADDING_LEFT + (selectedPointIndex * pointSpacing);
                // Position tooltip on opposite side of the line from center
                const tooltipWidth = 130;
                const tooltipGap = 8;
                const isLeftHalf = cursorX < chartWidth / 2;
                const tooltipLeft = isLeftHalf
                  ? cursorX + tooltipGap
                  : cursorX - tooltipWidth - tooltipGap;
                return (
                  <>
                    <View style={{
                      position: 'absolute',
                      left: cursorX,
                      top: 8,
                      bottom: 0,
                      width: 1,
                      backgroundColor: 'rgba(212, 165, 116, 0.5)',
                      zIndex: 5,
                      pointerEvents: 'none',
                    }} />
                    <View style={{
                      position: 'absolute',
                      left: cursorX - 4,
                      top: 8,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: '#D4A574',
                      zIndex: 6,
                      pointerEvents: 'none',
                    }} />
                    <View style={{
                      position: 'absolute',
                      top: 10,
                      left: tooltipLeft,
                      width: tooltipWidth,
                      backgroundColor: '#1C2430',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#D4A574',
                      zIndex: 10,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 5,
                      pointerEvents: 'none',
                    }}>
                      <Text style={{ color: '#8B9CB6', fontSize: 12, marginBottom: 2 }}>
                        {new Date(rawChartData[selectedPointIndex].datetime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#E8E8E8', fontSize: 18, fontWeight: '600', marginRight: 4 }}>
                          {Math.round(rawChartData[selectedPointIndex].avg_price)}
                        </Text>
                        <Image
                          source={require('../../assets/imgs/img_platinum.png')}
                          style={{ width: 18, height: 18 }}
                        />
                      </View>
                    </View>
                  </>
                );
              })()}
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
                }}
                bezier
                style={{
                  marginTop: 8,
                  marginBottom: -8,
                  borderRadius: 16,
                  backgroundColor: 'transparent',
                }}
              />
            </View>
            {isMod && availableModRanks.length > 0 && (
              <View style={{ marginTop: 0, width: '100%' }}>
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
                          setSelectedPointIndex(null);
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
                          setSelectedPointIndex(null);
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

        {(latestPrice || marketStats) && (
          <View style={{
            backgroundColor: '#10151C',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2C3545',
            marginTop: 12,
            overflow: 'hidden',
          }}>
            {latestPrice && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}>
                <Text style={{
                  color: '#8B9CB6',
                  fontSize: 15,
                }}>
                  Average Price (Today)
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

            {marketStats && (
              <>
                {latestPrice && (
                  <View style={{
                    height: 1,
                    backgroundColor: '#1C2430',
                    marginHorizontal: 16,
                  }} />
                )}
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}>
                  <Text style={{
                    color: '#8B9CB6',
                    fontSize: 15,
                  }}>
                    Max Price (90d)
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                      color: '#E8E8E8',
                      fontSize: 18,
                      fontWeight: '600',
                      marginRight: 6,
                    }}>
                      {Math.round(marketStats.maxPrice)}
                    </Text>
                    <Image
                      source={require('../../assets/imgs/img_platinum.png')}
                      style={{ width: 18, height: 18 }}
                    />
                  </View>
                </View>

                <View style={{
                  height: 1,
                  backgroundColor: '#1C2430',
                  marginHorizontal: 16,
                }} />

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}>
                  <Text style={{
                    color: '#8B9CB6',
                    fontSize: 15,
                  }}>
                    Min Price (90d)
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                      color: '#E8E8E8',
                      fontSize: 18,
                      fontWeight: '600',
                      marginRight: 6,
                    }}>
                      {Math.round(marketStats.minPrice)}
                    </Text>
                    <Image
                      source={require('../../assets/imgs/img_platinum.png')}
                      style={{ width: 18, height: 18 }}
                    />
                  </View>
                </View>

                <View style={{
                  height: 1,
                  backgroundColor: '#1C2430',
                  marginHorizontal: 16,
                }} />

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}>
                  <Text style={{
                    color: '#8B9CB6',
                    fontSize: 15,
                  }}>
                    Total Sold (90d)
                  </Text>
                  <Text style={{
                    color: '#E8E8E8',
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                    {marketStats.totalVolume.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
