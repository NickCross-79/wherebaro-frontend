import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
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
    color: colors.accent,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItemColumn: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  deviceIdValue: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  textInput: {
    marginTop: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  credits: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  creditsText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  creditsSubtext: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 4,
  },
});

export default styles;
