import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#0F1419',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B9DC3',
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
    color: '#8B9DC3',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    textAlign: 'center',
  },
});

export default styles;
