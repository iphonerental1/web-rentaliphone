/**
 * Helper to generate unique booking invoice codes (e.g. INV-20261020-001)
 */
const generateBookingCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `INV-${year}${month}${day}-${randomSuffix}`;
};

/**
 * Helper to generate URL-friendly slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

module.exports = {
  generateBookingCode,
  slugify,
};
