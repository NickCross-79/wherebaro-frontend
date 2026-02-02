import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D4A574',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0E1A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  showcaseCard: {
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderWidth: 2,
    borderColor: '#D4A574',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  showcaseCardBackground: {
    position: 'relative',
    minHeight: 220,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showcaseCardImage: {
    borderRadius: 16,
    borderTopLeftRadius: 0,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    marginTop: -48,
  },
  itemImage: {
    width: 130,
    height: 130,
  },
  itemInfo: {
    position: 'absolute',
    left: 16,
    bottom: 8,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
  },
  priceStack: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    alignItems: 'flex-end',
    gap: 6,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceIcon: {
    width: 16,
    height: 16,
  },
  creditPrice: {
    fontSize: 16,
    color: '#E8E8E8',
    fontWeight: '700',
  },
  ducatPrice: {
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '700',
  },
});

export default styles;
