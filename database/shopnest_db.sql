-- ShopNest Database Setup Script
-- Database: shopnest_db

CREATE DATABASE IF NOT EXISTS `shopnest_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shopnest_db`;

-- --------------------------------------------------------
-- Table structure for users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for products
-- --------------------------------------------------------
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for carts
-- --------------------------------------------------------
CREATE TABLE `carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for cart_items
-- --------------------------------------------------------
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  UNIQUE KEY `unique_cart_product` (`cart_id`, `product_id`),
  FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for orders
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for order_items
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data
-- --------------------------------------------------------

-- Default Hashed Passwords (bcrypt salt 10):
-- 'admin123'    => '$2a$10$wT5H5L7u/pU4R.5J0l5vGu05s6f/VvN1qS7V6M8a9Kx9dE2S8X7'
-- 'customer123' => '$2a$10$wT5H5L7u/pU4R.5J0l5vGu05s6f/VvN1qS7V6M8a9Kx9dE2S8X7'

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `address`, `role`, `status`) VALUES
(1, 'ShopNest Admin', 'admin@shopnest.com', '+1 555-0199', '$2a$10$wT5H5L7u/pU4R.5J0l5vGu05s6f/VvN1qS7V6M8a9Kx9dE2S8X7', '100 Tech Park, Silicon Valley, CA', 'admin', 'active'),
(2, 'John Doe', 'john@example.com', '+1 555-0144', '$2a$10$wT5H5L7u/pU4R.5J0l5vGu05s6f/VvN1qS7V6M8a9Kx9dE2S8X7', '742 Evergreen Terrace, Springfield, OR', 'customer', 'active');

INSERT INTO `categories` (`id`, `category_name`) VALUES
(1, 'Electronics'),
(2, 'Fashion'),
(3, 'Home & Living'),
(4, 'Beauty'),
(5, 'Accessories');

INSERT INTO `products` (`id`, `category_id`, `product_name`, `description`, `price`, `stock`, `image`) VALUES
(1, 1, 'Pro Wireless Noise-Canceling Headphones', 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.', 199.99, 25, 'headphones.jpg'),
(2, 1, 'Ultra HD Smart Watch Series 5', 'Water-resistant smartwatch featuring fitness tracking, heart rate monitor, AMOLED display, and seamless notification sync.', 149.50, 15, 'smartwatch.jpg'),
(3, 1, 'Ergonomic Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with tactile blue switches, detachable wrist rest, and durable aluminum top frame.', 89.99, 40, 'keyboard.jpg'),
(4, 2, 'Classic Leather Jacket', '100% genuine vintage leather jacket with smooth viscose lining, sturdy brass zippers, and tailored modern fit.', 129.99, 12, 'leather_jacket.jpg'),
(5, 2, 'Breathable Running Sneakers', 'Lightweight mesh athletic sneakers designed for optimal shock absorption, flexibility, and daily endurance running.', 75.00, 30, 'sneakers.jpg'),
(6, 3, 'Smart Ambient LED Desk Lamp', 'Adjustable color temperature desk lamp with wireless smartphone charging pad and touch-sensitive brightness slider.', 45.99, 20, 'lamp.jpg'),
(7, 4, 'Organic Botanical Facial Cleanser', 'Gentle daily cleanser infused with tea tree oil and vitamin C to deeply nourish, refresh, and balance skin tone.', 24.50, 50, 'cleanser.jpg'),
(8, 5, 'Minimalist Waterproof Backpack', 'Water-resistant roll-top backpack with padded 15.6-inch laptop sleeve, hidden anti-theft pocket, and USB port.', 59.99, 18, 'backpack.jpg');
