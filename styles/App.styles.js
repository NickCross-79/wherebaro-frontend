import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E1A',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  loadingUidContainer: {
    alignItems: 'center',
  },
  loadingUidLabel: {
    color: '#D4A574',
    fontSize: 12,
    marginBottom: 4,
  },
  loadingUidValue: {
    color: '#8B9DC3',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default styles;
