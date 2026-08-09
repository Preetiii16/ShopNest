const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simple SVG placeholder images generator
const images = [
  { name: 'headphones.jpg', title: 'Wireless Headphones', bg: '#4f46e5', icon: '🎧' },
  { name: 'smartwatch.jpg', title: 'Smart Watch Series 5', bg: '#0891b2', icon: '⌚' },
  { name: 'keyboard.jpg', title: 'Gaming Keyboard', bg: '#3b82f6', icon: '⌨️' },
  { name: 'leather_jacket.jpg', title: 'Classic Leather Jacket', bg: '#78350f', icon: '🧥' },
  { name: 'sneakers.jpg', title: 'Running Sneakers', bg: '#10b981', icon: '👟' },
  { name: 'lamp.jpg', title: 'Smart LED Desk Lamp', bg: '#f59e0b', icon: '💡' },
  { name: 'cleanser.jpg', title: 'Botanical Cleanser', bg: '#ec4899', icon: '🧴' },
  { name: 'backpack.jpg', title: 'Waterproof Backpack', bg: '#64748b', icon: '🎒' },
  { name: 'default-product.jpg', title: 'ShopNest Product', bg: '#6366f1', icon: '📦' }
];

images.forEach(img => {
  const filePath = path.join(uploadDir, img.name);
  if (!fs.existsSync(filePath)) {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="${img.bg}"/>
        <circle cx="300" cy="200" r="100" fill="rgba(255,255,255,0.2)"/>
        <text x="300" y="220" font-size="90" text-anchor="middle">${img.icon}</text>
        <text x="300" y="340" font-size="28" font-weight="bold" fill="#ffffff" font-family="sans-serif" text-anchor="middle">${img.title}</text>
        <text x="300" y="380" font-size="18" fill="rgba(255,255,255,0.8)" font-family="sans-serif" text-anchor="middle">ShopNest Authentic Product</text>
      </svg>
    `;
    fs.writeFileSync(filePath, svgContent.trim());
    console.log(`Generated image asset: ${img.name}`);
  }
});
