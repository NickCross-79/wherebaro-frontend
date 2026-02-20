import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 12,
  },
  iconButton: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: colors.textOnAccent,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default styles;
