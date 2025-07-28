/**
 * Validates and returns a safe image URL
 * @param {string} imageUrl - The image URL to validate
 * @param {string} fallbackUrl - The fallback URL if the image is invalid
 * @returns {string} - A safe image URL
 */
export const getSafeImageUrl = (imageUrl, fallbackUrl = '/src/images/default-product.jpg') => {
  if (!imageUrl) {
    return fallbackUrl;
  }

  // Check if it's a valid base64 URL
  if (imageUrl.startsWith('data:image/')) {
    // Base64 URLs should be longer than 100 characters to be valid
    if (imageUrl.length > 100) {
      return imageUrl;
    } else {
      return fallbackUrl;
    }
  }

  // Check if it's a regular URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // If it's neither base64 nor a valid URL, return fallback
  return fallbackUrl;
};

/**
 * Handles image error by setting fallback image
 * @param {Event} e - The error event
 * @param {string} fallbackUrl - The fallback URL
 */
export const handleImageError = (e, fallbackUrl = '/src/images/default-product.jpg') => {
  e.target.src = fallbackUrl;
}; 