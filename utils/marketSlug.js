// Converts a Warframe item name to a warframe.market slug
// Example: 'Primed Flow' => 'primed_flow'
// warframe.market slugs are lowercase, spaces and dashes replaced with _, apostrophes removed, and some special cases
export function toMarketSlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/['’]/g, '') // remove apostrophes
    .replace(/[^a-z0-9]+/g, '_') // non-alphanum to _
    .replace(/_+/g, '_') // collapse multiple _
    .replace(/^_+|_+$/g, ''); // trim _
}
