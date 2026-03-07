import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  collapsedTimerOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedTimerText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  collapsedRelayText: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
  },
  searchBarGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default styles;
