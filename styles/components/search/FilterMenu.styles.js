import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  menuContent: {
    backgroundColor: '#0F1419',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D4A574',
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  filterBadge: {
    backgroundColor: '#D4A574',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterBadgeText: {
    color: '#0A0E1A',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5A6B8C',
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: '#D4A574',
    backgroundColor: '#D4A574',
  },
  chipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0A0E1A',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#151B23',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#151B23',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#D4A574',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A2332',
  },
  clearButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4A574',
    alignItems: 'center',
  },
  clearButtonDisabled: {
    borderColor: '#3A3A3A',
    opacity: 0.5,
  },
  clearButtonText: {
    color: '#D4A574',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButtonTextDisabled: {
    color: '#5A6B8C',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#D4A574',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default styles;
