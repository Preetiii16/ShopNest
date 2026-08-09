// Centralized API Configuration
const API_URL = '/api';

function getImageUrl(imageName) {
  if (!imageName) return '/uploads/products/default-product.jpg';
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
  return `/uploads/products/${imageName}`;
}
