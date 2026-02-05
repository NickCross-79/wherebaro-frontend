import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../styles/components/baro/NewItemShowcase.styles';

function NewItemShowcase({ item, onPress }) {
  if (!item) return null;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>NEW ITEM</Text>
      </View>
      
      <TouchableOpacity style={styles.showcaseCard} onPress={onPress}>
        <ImageBackground
            source={require('../../assets/imgs/background_newItem.png')}
          style={styles.showcaseCardBackground}
          imageStyle={styles.showcaseCardImage}
          resizeMode="cover"
          blurRadius={4}
        >
          <LinearGradient
            colors={['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.15)']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.gradientOverlay}
            pointerEvents="none"
          />
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>{item.type}</Text>
          </View>

          <View style={styles.priceStack}>
            <View style={styles.priceItem}>
              <Image
                source={require('../../assets/imgs/img_credit.png')}
                style={styles.priceIcon}
              />
              <Text style={styles.creditPrice}>{item.creditPrice?.toLocaleString()}</Text>
            </View>
            <View style={styles.priceItem}>
              <Image
                source={require('../../assets/imgs/img_ducat.png')}
                style={styles.priceIcon}
              />
              <Text style={styles.ducatPrice}>{item.ducatPrice}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

export default memo(NewItemShowcase);

