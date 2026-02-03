const WARFRAME_IMAGE_BASE = 'https://wiki.warframe.com/images';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';
const PRIMED_DISSAPOINTMENT_IMAGE = 'https://i.imgur.com/ZYakUku.png';

const buildImageUrl = (image) => {
  if (!image) return PLACEHOLDER_IMAGE;
  if (image === 'Primed Dissapointment') return PRIMED_DISSAPOINTMENT_IMAGE;
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
    likes: Array.isArray(item?.likes) ? item.likes.length : item?.likes || 0,
    reviews: item?.reviews || [],
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
