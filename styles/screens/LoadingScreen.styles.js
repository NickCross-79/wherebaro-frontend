import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.accent,
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default styles;
