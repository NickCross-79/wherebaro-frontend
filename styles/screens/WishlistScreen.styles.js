import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  budgetBar: {
    position: 'absolute',
    top: 94, // TITLE_BAR_HEIGHT
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 10,
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
    left: 0,
    right: 0,
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
  ducatPlanner: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ducatPlannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  ducatPlannerLabel: {
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ducatPlannerCosts: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  ducatPlannerStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ducatPlannerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  ducatPlannerUnit: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  ducatPlannerSep: {
    fontSize: 14,
    color: colors.textDim,
    marginHorizontal: 2,
  },
  ducatPlannerAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ducatPlannerAvailableText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
});

export default styles;
