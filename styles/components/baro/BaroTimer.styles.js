import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  timerContainer: {
    marginTop: 15,
    padding: 14,
    backgroundColor: '#0F1419',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A574',
    borderWidth: 1,
    borderColor: '#1A2332',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  centered: {
    marginTop: 0,
    padding: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  centeredRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 12,
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '700',
  },
  centeredText: {
    textAlign: 'center',
  },
  timerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  timerValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default styles;
