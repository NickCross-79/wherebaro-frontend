import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9BA5B8',
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});

export default styles;
