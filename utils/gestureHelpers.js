import { Gesture } from 'react-native-gesture-handler';

export const createSwipeGesture = (activeTab, setActiveTab, navigation, hasMarketTab = false) => {
  return Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .shouldCancelWhenOutside(true)
    .onEnd((event, context) => {
      const { translationX } = event;

      // Only allow right swipe from details tab to go back (let it bubble)
      if (translationX > 40) {
        if (activeTab === 'market') {
          setActiveTab('reviews');
          event.stopPropagation && event.stopPropagation();
        } else if (activeTab === 'reviews') {
          setActiveTab('details');
          event.stopPropagation && event.stopPropagation();
        } else if (activeTab === 'details') {
          // Allow swipe right from details to bubble (to goBack)
          navigation.goBack();
        }
      } else if (translationX < -40) {
        // Only handle left swipe for tab switching, block bubbling
        if (activeTab === 'details') {
          setActiveTab('reviews');
          event.stopPropagation && event.stopPropagation();
        } else if (activeTab === 'reviews' && hasMarketTab) {
          setActiveTab('market');
          event.stopPropagation && event.stopPropagation();
        }
      }
    })
    .runOnJS(true);
};
