import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 'auto',
  },
  searchBar: {
    marginTop: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    justifyContent: 'flex-end',
  },
  searchBarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: 'center',
  },
});

export default styles;
