import { WARFRAME_IMAGE_BASE, PLACEHOLDER_IMAGE } from '../constants/items';

/**
 * Sentinel value used on the backend to indicate a generated mod image is pending
 * resolution from tempModImages. Preserved through normalization so InventoryContext
 * can detect it and fetch the actual data URI from getCurrent.
 */
export const MOD_IMAGE_SENTINEL = 'temp:modImage';

const buildWikiImageUrl = (wikiImageLink) => {
  if (!wikiImageLink) return PLACEHOLDER_IMAGE;
  // Sentinel for generated mod images — preserve as-is so downstream code can detect
  // and resolve it via getCurrent before displaying
  if (wikiImageLink === MOD_IMAGE_SENTINEL) return MOD_IMAGE_SENTINEL;
  // Full URLs (data URIs for generated mod images, already-absolute wiki links) — use as-is
  if (wikiImageLink.startsWith('http://') || wikiImageLink.startsWith('https://') || wikiImageLink.startsWith('data:')) return wikiImageLink;
  const trimmed = String(wikiImageLink).replace(/^\/+/, '');
  return `${WARFRAME_IMAGE_BASE}/${trimmed}`;
};

export const normalizeItem = (item, options = {}) => {
  const { includeDateAdded = false } = options;
  const offeringDates = Array.isArray(item?.offeringDates) ? item.offeringDates : [];

  const baseItem = {
    id: item?._id || item?.id,
    _id: item?._id || item?.id,
    name: item?.name,
    wikiImageLink: buildWikiImageUrl(item?.wikiImageLink),
    cdnImageLink: item?.cdnImageLink || '',
    link: item?.link,
    creditPrice: item?.creditPrice,
    ducatPrice: item?.ducatPrice,
    type: item?.type,
    offeringDates,
    uniqueName: item?.uniqueName || null,
    likes: Array.isArray(item?.likes) ? item.likes.length : item?.likes || 0,
    reviews: item?.reviews || [],
    wishlistCount: item?.wishlistCount || 0,
    buy: Array.isArray(item?.buy) ? item.buy : [],
    skip: Array.isArray(item?.skip) ? item.skip : [],
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
