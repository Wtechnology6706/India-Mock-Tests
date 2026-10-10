-- =========================================================================
-- INDIA MOCK TESTS - COMPREHENSIVE DATABASE MIGRATION SCRIPT (Ubuntu/Linux)
-- =========================================================================
-- Run this on your Ubuntu server:
-- mysql -u <user> -p <database_name> < database/migration_latest.sql
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure `coupons` Table & All Required Columns
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` INT NOT NULL DEFAULT 10,
  `min_order_minor` INT NOT NULL DEFAULT 0,
  `max_discount_minor` INT NOT NULL DEFAULT 0,
  `description` VARCHAR(255) DEFAULT '',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `starts_at` DATETIME NULL,
  `expires_at` DATETIME NULL,
  `usage_limit` INT NOT NULL DEFAULT 0,
  `usage_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_coupons_code` (`code`),
  INDEX `idx_coupons_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate columns if `coupons` was created by an older schema
SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'min_order_minor');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN min_order_minor INT NOT NULL DEFAULT 0 AFTER discount_value', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'max_discount_minor');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN max_discount_minor INT NOT NULL DEFAULT 0 AFTER min_order_minor', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'description');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN description VARCHAR(255) DEFAULT "" AFTER max_discount_minor', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'expires_at');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN expires_at DATETIME NULL AFTER starts_at', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'usage_limit');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN usage_limit INT NOT NULL DEFAULT 0 AFTER expires_at', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'usage_count');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN usage_count INT NOT NULL DEFAULT 0 AFTER usage_limit', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'created_at');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER usage_count', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'coupons' AND COLUMN_NAME = 'updated_at');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE coupons ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

-- Ensure coupon ID supports string codes
ALTER TABLE `coupons` MODIFY COLUMN `id` VARCHAR(64) NOT NULL;
ALTER TABLE `coupons` MODIFY COLUMN `discount_value` INT NOT NULL DEFAULT 10;
ALTER TABLE `coupons` MODIFY COLUMN `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage';

-- Seed default coupons if not present
INSERT IGNORE INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_minor`, `max_discount_minor`, `description`, `active`, `usage_limit`, `usage_count`, `created_at`)
VALUES
('cpn-welcome20', 'WELCOME20', 'percentage', 20, 29900, 20000, 'Get 20% instant discount on all VIP Exam passes!', 1, 1000, 0, NOW()),
('cpn-festive50', 'FESTIVE50', 'fixed', 50, 49900, 5000, 'Flat ₹50 OFF on orders above ₹499', 1, 500, 0, NOW()),
('cpn-bpsc100', 'BPSC100', 'fixed', 100, 40000, 10000, 'Special ₹100 instant waiver on BPSC and State Exam test bundles', 1, 200, 0, NOW());


-- 2. Ensure `commerce_plans` Table & Columns
CREATE TABLE IF NOT EXISTS `commerce_plans` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `description` TEXT,
  `amount_minor` INT NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'INR',
  `validity_days` INT NOT NULL DEFAULT 90,
  `features` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commerce_plans' AND COLUMN_NAME = 'features');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE commerce_plans ADD COLUMN features TEXT NULL AFTER validity_days', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

-- Seed default commerce plans
INSERT IGNORE INTO `commerce_plans` (`id`, `slug`, `name`, `description`, `amount_minor`, `currency`, `validity_days`, `features`, `active`, `created_at`)
VALUES
('1', 'sprint', 'Single Exam Sprint Pass', 'Targeted practice pass for 1 focused examination series.', 49900, 'INR', 90, '["Full access to 1 targeted exam category (e.g. BPSC TRE 4.0)","30+ Full Length Mock Tests + Chapter-wise drills","Detailed AI performance analytics & rank prediction","Bilingual Hindi & English test modes","Unlimited test re-attempts & revision bookmarking"]', 1, NOW()),
('2', 'ultimate', 'All-Exam Ultimate VIP Pass', 'All-inclusive pass for every state PSC, TET, and national exam.', 99900, 'INR', 180, '["All-Access Pass to EVERY Exam Category & PYQs","500+ Complete Mock Tests, Subject Quizzes & PYQs","Full PYQ PDF Hub with high-speed download & full-screen reader","Priority Doubt Solving & Video Solutions access","VIP Candidate Badge & 180-day extended validity"]', 1, NOW());


-- 3. Ensure `orders` Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `plan_id` VARCHAR(64) NOT NULL,
  `coupon_id` VARCHAR(64) NULL,
  `amount_minor` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('created', 'pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'created',
  `provider` VARCHAR(40) NOT NULL DEFAULT 'gateway',
  `provider_order_id` VARCHAR(180) NULL,
  `provider_payment_id` VARCHAR(180) NULL,
  `tax_details` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` DATETIME NULL,
  INDEX `idx_orders_user_status` (`user_id`, `status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. Ensure `wallets` and `wallet_transactions` Tables
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `balance_minor` BIGINT NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'INR',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wallets_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `type` ENUM('credit', 'debit') NOT NULL,
  `amount_minor` INT NOT NULL,
  `balance_after_minor` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `reference_type` ENUM('topup', 'purchase', 'refund', 'admin_adjustment') NOT NULL DEFAULT 'topup',
  `reference_id` VARCHAR(128) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wt_user` (`user_id`),
  INDEX `idx_wt_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. Ensure `pyq_documents` Table
CREATE TABLE IF NOT EXISTS `pyq_documents` (
  `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `exam_slug` VARCHAR(100) NOT NULL,
  `exam_name` VARCHAR(180) NOT NULL,
  `track_slug` VARCHAR(100) NOT NULL DEFAULT 'all',
  `subject_name` VARCHAR(180) NOT NULL,
  `year` INT UNSIGNED NOT NULL,
  `paper_name` VARCHAR(200) NOT NULL,
  `title` VARCHAR(250) NOT NULL,
  `description` TEXT NULL,
  `file_url` VARCHAR(1000) NOT NULL,
  `file_size` VARCHAR(50) NULL,
  `page_count` INT UNSIGNED NULL,
  `download_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `access_tier` ENUM('free', 'premium') NOT NULL DEFAULT 'free',
  `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pyq_exam_year` (`exam_slug`, `year`, `status`),
  INDEX `idx_pyq_subject` (`subject_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. Ensure `site_configurations` Table
CREATE TABLE IF NOT EXISTS `site_configurations` (
  `config_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `config_value` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 7. Add Missing Columns to `exams`
SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exams' AND COLUMN_NAME = 'image_url');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE exams ADD COLUMN image_url VARCHAR(500) NULL AFTER visual_symbol', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exams' AND COLUMN_NAME = 'badge');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE exams ADD COLUMN badge VARCHAR(40) NULL', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exams' AND COLUMN_NAME = 'visual_tone');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE exams ADD COLUMN visual_tone VARCHAR(30) NOT NULL DEFAULT "saffron"', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exams' AND COLUMN_NAME = 'visual_symbol');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE exams ADD COLUMN visual_symbol VARCHAR(8) NOT NULL DEFAULT "✦"', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;


-- 8. Add Missing Columns to `tests`
SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'banner_image_url');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE tests ADD COLUMN banner_image_url VARCHAR(500) NULL AFTER description', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

ALTER TABLE `tests` MODIFY COLUMN `test_type` VARCHAR(50) NOT NULL DEFAULT 'full';


-- 9. Add Missing Columns to `users`
SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'subscription_tier');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT "free"', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'subscription_expires_at');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'target_exam_slug');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE users ADD COLUMN target_exam_slug VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'target_exam_name');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE users ADD COLUMN target_exam_name VARCHAR(150) NULL', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'wallet_balance_minor');
SET @stmt := IF(@col_exist = 0, 'ALTER TABLE users ADD COLUMN wallet_balance_minor BIGINT DEFAULT 0', 'SELECT 1');
PREPARE stmt_exec FROM @stmt; EXECUTE stmt_exec; DEALLOCATE PREPARE stmt_exec;


SET FOREIGN_KEY_CHECKS = 1;
