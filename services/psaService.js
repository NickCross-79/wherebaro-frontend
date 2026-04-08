import { buildUrl, apiFetch } from './apiConfig';

const ENDPOINTS = {
  GET_PSA: buildUrl('getPsa'),
};

const PSA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let psaCache = null;

export const fetchPsa = async () => {
  if (psaCache && Date.now() - psaCache.timestamp < PSA_CACHE_TTL) {
    return psaCache.data;
  }

  const data = await apiFetch(ENDPOINTS.GET_PSA);
  // Normalise: backend always returns an array
  const list = Array.isArray(data) ? data : data ? [data] : [];
  psaCache = { data: list, timestamp: Date.now() };
  return list;
};
