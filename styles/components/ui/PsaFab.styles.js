import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 36,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    padding: 4,
  },
  pageIndicator: {
    fontSize: 13,
    color: colors.textMuted,
    minWidth: 36,
    textAlign: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'right',
    flex: 1,
  },
  gotItButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textOnAccent,
  },
});

export default styles;
