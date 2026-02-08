// Mock for @expo/vector-icons
import React from 'react';

const createIconMock = (name) => {
  const IconComponent = ({ name: iconName, size, color, ...rest }) =>
    React.createElement('text', { ...rest, testID: `icon-${iconName || name}` }, iconName || name);
  IconComponent.displayName = name;
  return IconComponent;
};

export const Ionicons = createIconMock('Ionicons');
export const MaterialIcons = createIconMock('MaterialIcons');
export const FontAwesome = createIconMock('FontAwesome');
export const Feather = createIconMock('Feather');
export default { Ionicons, MaterialIcons, FontAwesome, Feather };
