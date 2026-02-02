import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  searchWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1419',
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 12,
  },
  iconButton: {
    backgroundColor: '#0F1419',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#D4A574',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#0A0E1A',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default styles;
