import { WARFRAME_IMAGE_BASE, PLACEHOLDER_IMAGE, PRIMED_DISAPPOINTMENT_IMAGE } from '../constants/items';

const buildImageUrl = (image) => {
  if (!image) return PLACEHOLDER_IMAGE;
  // If already a full URL (e.g. CDN link for new items), use as-is
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const trimmed = String(image).replace(/^\/+/, '');
  return `${WARFRAME_IMAGE_BASE}/${trimmed}`;
};

export const normalizeItem = (item, options = {}) => {
  const { includeDateAdded = false } = options;
  const offeringDates = Array.isArray(item?.offeringDates) ? item.offeringDates : [];

  const baseItem = {
    id: item?._id || item?.id,
    _id: item?._id || item?.id,
    name: item?.name,
    image: buildImageUrl(item?.image),
    link: item?.link,
    creditPrice: item?.creditPrice,
    ducatPrice: item?.ducatPrice,
    type: item?.type,
    offeringDates,
    uniqueName: item?.uniqueName || null,
    likes: Array.isArray(item?.likes) ? item.likes.length : item?.likes || 0,
    reviews: item?.reviews || [],
    wishlistCount: item?.wishlistCount || 0,
  };

  if (!includeDateAdded) {
    return baseItem;
  }

  const lastOffering = offeringDates.length > 0
    ? new Date(offeringDates[offeringDates.length - 1])
    : null;

  return {
    ...baseItem,
    dateAdded: lastOffering,
  };
};
