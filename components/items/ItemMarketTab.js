import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image, PanResponder, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, accentWithOpacity } from '../../constants/theme';

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

  // Single memoized filter for the 90-day data — all chart/price/stats derive from this
  const filteredData = useMemo(() => {
    const arr = marketData?.statistics_closed?.['90days'] || [];
    if (!arr.length) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    let filtered = arr.filter(d => {
      const date = new Date(d.datetime);
      return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date >= cutoff;
    });

    if (isMod) {
      filtered = filtered.filter(d => d.mod_rank === selectedModRank);
    }
    if (isVoidRelic && selectedSubtype) {
      filtered = filtered.filter(d => d.subtype === selectedSubtype);
    }

    return filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }, [marketData, isMod, selectedModRank, isVoidRelic, selectedSubtype]);

  // Derive chart data from the single filtered dataset
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;
    const prices = filteredData.map(d => d.avg_price);
    const labels = filteredData.map((d, i) => {
      if (i === 0) {
        const date = new Date(d.datetime);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      const prevDate = new Date(filteredData[i - 1].datetime);
      const currDate = new Date(d.datetime);
      const daysDiff = (currDate - new Date(filteredData[0].datetime)) / (1000 * 60 * 60 * 24);
      const prevDaysDiff = (prevDate - new Date(filteredData[0].datetime)) / (1000 * 60 * 60 * 24);
      if (Math.floor(daysDiff / 15) > Math.floor(prevDaysDiff / 15)) {
        return `${currDate.getMonth() + 1}/${currDate.getDate()}`;
      }
      return '';
    });
    return {
      labels,
      datasets: [
        {
          data: prices,
          color: (opacity = 1) => accentWithOpacity(opacity),
          strokeWidth: 2,
        },
      ],
    };
  }, [filteredData]);

  const rawChartData = filteredData;

  // Derive latest price (last entry in ascending-sorted data)
  const latestPrice = useMemo(() => {
    if (!filteredData.length) return null;
    return filteredData[filteredData.length - 1]?.avg_price ?? null;
  }, [filteredData]);

  // Derive market stats
  const marketStats = useMemo(() => {
    if (!filteredData.length) return null;
    const prices = filteredData.map(d => d.avg_price);
    const volumes = filteredData.map(d => d.volume || 0);
    return {
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
    };
  }, [filteredData]);

  // react-native-chart-kit positions data points as:
  //   x_i = paddingRight + (i * (width - paddingRight)) / dataLength
  // where paddingRight (the LEFT offset for y-axis labels) defaults to 64
  const CHART_LEFT_OFFSET = 64;

  // Throttled touch handler — batches via rAF to avoid re-rendering every move event
  const handleTouch = useCallback((event) => {
    const locationX = event.locationX;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const dataPointCount = selectedPointRef.current?.dataLength;
      if (!dataPointCount) return;
      const chartArea = chartWidth - CHART_LEFT_OFFSET;
      const pointSpacing = chartArea / dataPointCount;
      const adjustedX = locationX - CHART_LEFT_OFFSET;
      // If touch is outside the chart data area, clear selection
      if (adjustedX < -10 || adjustedX > chartArea + 10) {
        setSelectedPointIndex(null);
        return;
      }
      const index = Math.round(adjustedX / pointSpacing);
      const clampedIndex = Math.max(0, Math.min(index,  dataPointCount - 1));
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

  return (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.tabContent, marketStyles.scrollContent, { paddingBottom: bottomSpacer }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={marketStyles.section}>
        <Text style={styles.sectionTitle}>Price History (60 Days)</Text>
        
        {isLoadingMarket ? (
          <View style={marketStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.noDataText, marketStyles.loadingText]}>Loading market data...</Text>
          </View>
        ) : chartData ? (
          <View style={marketStyles.chartOuterWrapper}>
            <View
              ref={chartContainerRef}
              style={[marketStyles.chartContainer, { width: chartWidth }]}
              {...panResponder.panHandlers}
            >
              {selectedPointIndex !== null && rawChartData[selectedPointIndex] && (() => {
                const chartArea = chartWidth - CHART_LEFT_OFFSET;
                const pointSpacing = chartArea / rawChartData.length;
                const cursorX = CHART_LEFT_OFFSET + (selectedPointIndex * pointSpacing);
                const tooltipWidth = 130;
                const tooltipGap = 8;
                const isLeftHalf = cursorX < chartWidth / 2;
                const tooltipLeft = isLeftHalf
                  ? cursorX + tooltipGap
                  : cursorX - tooltipWidth - tooltipGap;
                return (
                  <>
                    <View style={[marketStyles.cursorLine, { left: cursorX }]} />
                    <View style={[marketStyles.cursorDot, { left: cursorX - 4 }]} />
                    <View style={[marketStyles.tooltip, { left: tooltipLeft, width: tooltipWidth }]}>
                      <Text style={marketStyles.tooltipDate}>
                        {new Date(rawChartData[selectedPointIndex].datetime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      <View style={marketStyles.priceRow}>
                        <Text style={marketStyles.tooltipPrice}>
                          {Math.round(rawChartData[selectedPointIndex].avg_price)}
                        </Text>
                        <Image
                          source={require('../../assets/imgs/img_platinum.png')}
                          style={marketStyles.platIcon}
                        />
                      </View>
                    </View>
                  </>
                );
              })()}
              <LineChart
                data={chartData}
                width={chartWidth}
                height={245}
                withHorizontalLines={false}
                withVerticalLines={false}
                withDots={false}
                chartConfig={{
                  backgroundGradientFrom: colors.background,
                  backgroundGradientTo: colors.background,
                  decimalPlaces: 0,
                  color: (opacity = 1) => accentWithOpacity(opacity),
                  labelColor: (opacity = 1) => accentWithOpacity(opacity),
                  fillShadowGradientFrom: colors.accent,
                  fillShadowGradientTo: colors.accent,
                  fillShadowGradientFromOpacity: 0.3,
                  fillShadowGradientToOpacity: 0.05,
                  paddingLeft: 0,
                  style: { borderRadius: 16 },
                }}
                bezier
                style={marketStyles.chart}
              />
            </View>
            {isMod && availableModRanks.length > 0 && (
              <View style={marketStyles.selectorContainer}>
                <TouchableOpacity
                  style={marketStyles.dropdownButton}
                  onPress={() => setIsRankDropdownOpen(!isRankDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={marketStyles.dropdownButtonText}>
                    {selectedRankLabel}
                  </Text>
                  <Ionicons
                    name={isRankDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.accent}
                  />
                </TouchableOpacity>

                {isRankDropdownOpen && (
                  <View style={marketStyles.dropdownList}>
                    {availableModRanks.map((rank, index) => (
                      <TouchableOpacity
                        key={rank}
                        onPress={() => {
                          setSelectedModRank(rank);
                          setSelectedPointIndex(null);
                          setIsRankDropdownOpen(false);
                        }}
                        style={[
                          marketStyles.dropdownItem,
                          index > 0 && marketStyles.dropdownItemBorder,
                          selectedModRank === rank && marketStyles.dropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            marketStyles.dropdownItemText,
                            selectedModRank === rank && marketStyles.dropdownItemTextSelected,
                          ]}
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
              <View style={marketStyles.subtypeSelectorContainer}>
                <TouchableOpacity
                  onPress={() => setIsSubtypeDropdownOpen(!isSubtypeDropdownOpen)}
                  style={marketStyles.subtypeDropdownButton}
                >
                  <Text style={marketStyles.subtypeDropdownText}>
                    {formatSubtypeLabel(selectedSubtype)}
                  </Text>
                  <Ionicons
                    name={isSubtypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.accent}
                  />
                </TouchableOpacity>

                {isSubtypeDropdownOpen && (
                  <View style={marketStyles.dropdownList}>
                    {availableSubtypes.map((subtype, index) => (
                      <TouchableOpacity
                        key={subtype}
                        onPress={() => {
                          setSelectedSubtype(subtype);
                          setSelectedPointIndex(null);
                          setIsSubtypeDropdownOpen(false);
                        }}
                        style={[
                          marketStyles.dropdownItem,
                          index > 0 && marketStyles.dropdownItemBorder,
                          selectedSubtype === subtype && marketStyles.dropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            marketStyles.dropdownItemText,
                            selectedSubtype === subtype && marketStyles.dropdownItemTextSelected,
                          ]}
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

      <View style={marketStyles.section}>
        <Text style={styles.sectionTitle}>Market Information</Text>

        {(latestPrice || marketStats) && (
          <View style={marketStyles.infoCard}>
            {latestPrice && (
              <View style={marketStyles.infoRow}>
                <Text style={marketStyles.infoLabel}>
                  Average Price (Today)
                </Text>
                <View style={marketStyles.priceRow}>
                  <Text style={marketStyles.infoValue}>
                    {Math.round(latestPrice)}
                  </Text>
                  <Image
                    source={require('../../assets/imgs/img_platinum.png')}
                    style={marketStyles.platIcon}
                  />
                </View>
              </View>
            )}

            {marketStats && (
              <>
                {latestPrice && <View style={marketStyles.divider} />}
                
                <View style={marketStyles.infoRow}>
                  <Text style={marketStyles.infoLabel}>
                    Max Price (60d)
                  </Text>
                  <View style={marketStyles.priceRow}>
                    <Text style={marketStyles.infoValue}>
                      {Math.round(marketStats.maxPrice)}
                    </Text>
                    <Image
                      source={require('../../assets/imgs/img_platinum.png')}
                      style={marketStyles.platIcon}
                    />
                  </View>
                </View>

                <View style={marketStyles.divider} />

                <View style={marketStyles.infoRow}>
                  <Text style={marketStyles.infoLabel}>
                    Min Price (60d)
                  </Text>
                  <View style={marketStyles.priceRow}>
                    <Text style={marketStyles.infoValue}>
                      {Math.round(marketStats.minPrice)}
                    </Text>
                    <Image
                      source={require('../../assets/imgs/img_platinum.png')}
                      style={marketStyles.platIcon}
                    />
                  </View>
                </View>

                <View style={marketStyles.divider} />

                <View style={marketStyles.infoRow}>
                  <Text style={marketStyles.infoLabel}>
                    Total Sold (60d)
                  </Text>
                  <Text style={marketStyles.infoValue}>
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

const marketStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  chartOuterWrapper: {
    width: '100%',
    alignItems: 'flex-end',
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    marginTop: 8,
    marginBottom: -8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  cursorLine: {
    position: 'absolute',
    top: 8,
    bottom: 0,
    width: 1,
    backgroundColor: colors.accentMuted,
    zIndex: 5,
    pointerEvents: 'none',
  },
  cursorDot: {
    position: 'absolute',
    top: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    zIndex: 6,
    pointerEvents: 'none',
  },
  tooltip: {
    position: 'absolute',
    top: 10,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    zIndex: 10,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    pointerEvents: 'none',
  },
  tooltipDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  tooltipPrice: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platIcon: {
    width: 18,
    height: 18,
  },
  selectorContainer: {
    marginTop: 0,
    width: '100%',
  },
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: colors.accent,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderChart,
    overflow: 'hidden',
    backgroundColor: colors.surfaceChart,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceElevated,
  },
  dropdownItemSelected: {
    backgroundColor: colors.accent,
  },
  dropdownItemText: {
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: colors.chartTooltipBg,
  },
  subtypeSelectorContainer: {
    marginTop: 12,
    width: '100%',
  },
  subtypeDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderChart,
    backgroundColor: colors.surfaceChart,
  },
  subtypeDropdownText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: colors.surfaceChart,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderChart,
    marginTop: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  infoValue: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 16,
  },
});
