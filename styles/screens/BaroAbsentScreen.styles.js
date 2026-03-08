import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  journeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  baroIcon: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  earthIcon: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  iconLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  travelPath: {
    flex: 1,
    height: 80,
    marginHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  waveDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    top: '50%',
    marginTop: -4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },
  timerSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  locationText: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 4,
  },
  hint: {
    fontSize: 14,
    color: colors.textDim,
    fontStyle: 'italic',
  },
});

export default styles;
