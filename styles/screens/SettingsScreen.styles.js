import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
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
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  settingItem: {
    backgroundColor: '#0F1419',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  settingItemColumn: {
    backgroundColor: '#0F1419',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9BA5B8',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: '#9BA5B8',
    fontWeight: '600',
  },
  textInput: {
    marginTop: 12,
    backgroundColor: '#151B23',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2332',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  credits: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  creditsText: {
    fontSize: 14,
    color: '#9BA5B8',
    fontWeight: '700',
  },
  creditsSubtext: {
    fontSize: 12,
    color: '#5A6B8C',
    marginTop: 4,
  },
});

export default styles;
