import { Gesture } from 'react-native-gesture-handler';

export const createSwipeGesture = (activeTab, setActiveTab, navigation, hasMarketTab = false) => {
  return Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .shouldCancelWhenOutside(true)
    .onEnd((event) => {
      const { translationX } = event;

      if (translationX > 40) {
        // Swipe right (go back through tabs or exit)
        if (activeTab === 'market') {
          setActiveTab('reviews');
        } else if (activeTab === 'reviews') {
          setActiveTab('details');
        } else if (activeTab === 'details') {
          navigation.goBack();
        }
      } else if (translationX < -40) {
        // Swipe left (go forward)
        if (activeTab === 'details') {
          setActiveTab('reviews');
        } else if (activeTab === 'reviews' && hasMarketTab) {
          setActiveTab('market');
        }
      }
    })
    .runOnJS(true);
};
