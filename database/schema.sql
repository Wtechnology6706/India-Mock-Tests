CREATE TABLE IF NOT EXISTS countries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  code CHAR(2) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sectors (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sector_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (sector_id) REFERENCES sectors(id)
);

CREATE TABLE IF NOT EXISTS organizations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  country_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  official_url VARCHAR(500) NULL,
  FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS exams (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  country_id BIGINT UNSIGNED NULL,
  category_id BIGINT UNSIGNED NULL,
  organization_id BIGINT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  badge VARCHAR(40) NULL,
  visual_tone VARCHAR(30) NOT NULL DEFAULT 'saffron',
  visual_symbol VARCHAR(8) NOT NULL DEFAULT '✦',
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_exams_discovery (status, category_id, updated_at)
);

CREATE TABLE IF NOT EXISTS exam_editions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  exam_date DATE NULL,
  source_url VARCHAR(500) NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  INDEX idx_editions_exam (exam_id, status)
);

CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  UNIQUE KEY uq_subject_exam_slug (exam_id, slug)
);

CREATE TABLE IF NOT EXISTS topics (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subject_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (parent_id) REFERENCES topics(id),
  UNIQUE KEY uq_topic_subject_slug (subject_id, slug)
);

CREATE TABLE IF NOT EXISTS rule_profiles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NOT NULL,
  version INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  option_count TINYINT UNSIGNED NOT NULL DEFAULT 4,
  marks_per_correct DECIMAL(8,3) NOT NULL DEFAULT 1,
  penalty_wrong DECIMAL(8,3) NOT NULL DEFAULT 0,
  penalty_unanswered DECIMAL(8,3) NOT NULL DEFAULT 0,
  special_option_key CHAR(1) NULL,
  penalty_special DECIMAL(8,3) NOT NULL DEFAULT 0,
  source_url VARCHAR(500) NULL,
  effective_from DATE NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  UNIQUE KEY uq_rule_exam_version (exam_id, version)
);

CREATE TABLE IF NOT EXISTS test_series (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NULL,
  access_type ENUM('free', 'premium') NOT NULL DEFAULT 'free',
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  INDEX idx_series_exam_status (exam_id, status)
);

CREATE TABLE IF NOT EXISTS tests (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  test_series_id BIGINT UNSIGNED NULL,
  rule_profile_id BIGINT UNSIGNED NULL,
  exam_id BIGINT UNSIGNED NULL,
  subject_id BIGINT UNSIGNED NULL,
  track_slug VARCHAR(100) NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) UNIQUE NULL,
  test_type VARCHAR(50) NOT NULL DEFAULT 'full',
  question_count INT UNSIGNED NOT NULL DEFAULT 0,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  total_marks DECIMAL(8,3) NOT NULL DEFAULT 0,
  access_type ENUM('free', 'premium') NOT NULL DEFAULT 'free',
  description TEXT NULL,
  banner_image_url VARCHAR(500) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (test_series_id) REFERENCES test_series(id),
  FOREIGN KEY (rule_profile_id) REFERENCES rule_profiles(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  INDEX idx_tests_catalog (status, test_type),
  INDEX idx_tests_exam_subject (exam_id, subject_id, track_slug)
);

CREATE TABLE IF NOT EXISTS test_requests (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_slug VARCHAR(100) NOT NULL,
  track_slug VARCHAR(100) NOT NULL,
  subject_name VARCHAR(180) NOT NULL,
  request_count INT UNSIGNED NOT NULL DEFAULT 1,
  last_requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_exam_subject_request (exam_slug, track_slug, subject_name)
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subject_id BIGINT UNSIGNED NULL,
  topic_id BIGINT UNSIGNED NULL,
  stem TEXT NOT NULL,
  explanation TEXT NULL,
  status ENUM('draft', 'in_review', 'approved', 'published', 'archived') NOT NULL DEFAULT 'draft',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  version INT NOT NULL DEFAULT 1,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  INDEX idx_questions_review (status, subject_id, topic_id)
);

CREATE TABLE IF NOT EXISTS question_options (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  option_key CHAR(1) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  sort_order TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE KEY uq_question_option (question_id, option_key)
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role ENUM('student', 'editor', 'reviewer', 'admin') NOT NULL DEFAULT 'student',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP NULL,
  target_exam_slug VARCHAR(100) NULL,
  target_exam_name VARCHAR(150) NULL,
  wallet_balance_minor BIGINT DEFAULT 0,
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entitlements (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  test_series_id BIGINT UNSIGNED NULL,
  starts_at DATETIME NOT NULL,
  expires_at DATETIME NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'purchase',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (test_series_id) REFERENCES test_series(id),
  INDEX idx_entitlements_access (user_id, starts_at, expires_at)
);

CREATE TABLE IF NOT EXISTS exam_levels (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(160) NOT NULL,
  audience VARCHAR(220) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  UNIQUE KEY uq_exam_level (exam_id, slug)
);

CREATE TABLE IF NOT EXISTS subject_catalog (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL UNIQUE,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NULL
);

CREATE TABLE IF NOT EXISTS exam_level_subjects (
  exam_level_id BIGINT UNSIGNED NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (exam_level_id, subject_id),
  FOREIGN KEY (exam_level_id) REFERENCES exam_levels(id),
  FOREIGN KEY (subject_id) REFERENCES subject_catalog(id)
);

CREATE TABLE IF NOT EXISTS subject_topics (
  subject_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (subject_id, topic_id),
  FOREIGN KEY (subject_id) REFERENCES subject_catalog(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_sessions_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id CHAR(36) PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  test_slug VARCHAR(200) NOT NULL,
  test_title VARCHAR(200) NOT NULL,
  exam_name VARCHAR(180) NOT NULL,
  question_snapshot JSON NOT NULL,
  rule_snapshot JSON NOT NULL,
  answers JSON NOT NULL,
  reviewed JSON NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  result_snapshot JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_attempt_user (user_id, started_at),
  INDEX idx_attempt_test (test_slug, started_at)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_audit_actor_date (actor_user_id, created_at),
  INDEX idx_audit_entity (entity_type, entity_id, created_at)
);

CREATE TABLE IF NOT EXISTS test_questions (
  test_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  marks DECIMAL(8,3) NULL,
  PRIMARY KEY (test_id, question_id),
  UNIQUE KEY uq_test_question_order (test_id, sort_order),
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS question_assets (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  option_id BIGINT UNSIGNED NULL,
  media_url VARCHAR(1000) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  alt_text VARCHAR(300) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (option_id) REFERENCES question_options(id)
);

CREATE TABLE IF NOT EXISTS exam_notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT UNSIGNED NULL,
  title VARCHAR(240) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  category VARCHAR(120) NOT NULL,
  summary TEXT NOT NULL,
  status ENUM('open', 'closing_soon', 'announced', 'closed') NOT NULL DEFAULT 'announced',
  published_at DATETIME NOT NULL,
  official_source_url VARCHAR(1000) NOT NULL,
  official_apply_url VARCHAR(1000) NULL,
  source_reference VARCHAR(200) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_notifications_feed (status, published_at)
);

CREATE TABLE IF NOT EXISTS commerce_plans (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT NULL,
  amount_minor INT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  validity_days INT NOT NULL DEFAULT 90,
  features TEXT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discount_value INT NOT NULL DEFAULT 10,
  min_order_minor INT NOT NULL DEFAULT 0,
  max_discount_minor INT NOT NULL DEFAULT 0,
  description VARCHAR(255) DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  usage_limit INT NOT NULL DEFAULT 0,
  usage_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code (code),
  INDEX idx_coupons_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  coupon_id VARCHAR(64) NULL,
  amount_minor INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status ENUM('created', 'pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'created',
  provider VARCHAR(40) NOT NULL DEFAULT 'gateway',
  provider_order_id VARCHAR(180) NULL,
  provider_payment_id VARCHAR(180) NULL,
  tax_details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  INDEX idx_orders_user_status (user_id, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  balance_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wallets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  amount_minor INT NOT NULL,
  balance_after_minor INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  reference_type ENUM('topup', 'purchase', 'refund', 'admin_adjustment') NOT NULL DEFAULT 'topup',
  reference_id VARCHAR(128) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wt_user (user_id),
  INDEX idx_wt_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pyq_documents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(191) NOT NULL UNIQUE,
  exam_slug VARCHAR(100) NOT NULL,
  exam_name VARCHAR(180) NOT NULL,
  track_slug VARCHAR(100) NOT NULL DEFAULT 'all',
  subject_name VARCHAR(180) NOT NULL,
  year INT UNSIGNED NOT NULL,
  paper_name VARCHAR(200) NOT NULL,
  title VARCHAR(250) NOT NULL,
  description TEXT NULL,
  file_url VARCHAR(1000) NOT NULL,
  file_size VARCHAR(50) NULL,
  page_count INT UNSIGNED NULL,
  download_count INT UNSIGNED NOT NULL DEFAULT 0,
  access_tier ENUM('free', 'premium') NOT NULL DEFAULT 'free',
  status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pyq_exam_year (exam_slug, year, status),
  INDEX idx_pyq_subject (subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_configurations (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;