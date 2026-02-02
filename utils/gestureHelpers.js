import { Gesture } from 'react-native-gesture-handler';

export const createSwipeGesture = (activeTab, setActiveTab, navigation) => {
  return Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((event) => {
      const { translationX } = event;

      if (translationX > 80) {
        if (activeTab === 'reviews') {
          setActiveTab('details');
        } else {
          navigation.goBack();
        }
      } else if (translationX < -80 && activeTab !== 'reviews') {
        setActiveTab('reviews');
      }
    });
};
