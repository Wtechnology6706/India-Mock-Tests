-- ============================================================================
-- BPSC TRE 4.0 COMPLETE SYLLABUS & EXAM SEED SQL SCRIPT
-- Database: mock_test_platform
-- Aligned with Bihar Public Service Commission (BPSC) Official Syllabus & Exam Pattern
-- ============================================================================

USE mock_test_platform;

-- 1. Ensure Country, Organization & Category
INSERT INTO countries (name, code)
VALUES ('India', 'IN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO sectors (name, slug)
VALUES ('Education', 'education')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (sector_id, name, slug)
SELECT id, 'Teaching Exams', 'teaching' FROM sectors WHERE slug = 'education' LIMIT 1
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO organizations (country_id, name, slug, official_url)
SELECT id, 'Bihar Public Service Commission', 'bpsc', 'https://bpsc.bih.nic.in' FROM countries WHERE code = 'IN' LIMIT 1
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ----------------------------------------------------------------------------
-- 2. Master BPSC TRE 4.0 Exam Record
-- ----------------------------------------------------------------------------
INSERT INTO exams (country_id, category_id, organization_id, name, slug, description, status, badge, visual_tone, visual_symbol, image_url)
SELECT
  c.id, cat.id, org.id,
  'BPSC TRE 4.0',
  'bpsc-tre-4',
  'Bihar Public Service Commission Teacher Recruitment Examination (TRE 4.0) for Primary (1-5), Middle (6-8), Secondary TGT (9-10), and Higher Secondary PGT (11-12).',
  'published',
  'Popular',
  'saffron',
  '✦',
  '/uploads/taxonomy/bpsc-tre-cover-1792847844078.png'
FROM countries c
JOIN categories cat ON cat.slug = 'teaching'
JOIN organizations org ON org.slug = 'bpsc'
WHERE c.code = 'IN'
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  status = 'published',
  badge = VALUES(badge),
  image_url = VALUES(image_url);

-- Set local session variable for the exam ID
SET @bpsc_exam_id := (SELECT id FROM exams WHERE slug = 'bpsc-tre-4' LIMIT 1);

-- ----------------------------------------------------------------------------
-- 3. Official 5-Option Scoring Rule Profile (+1.00 / -0.25)
-- ----------------------------------------------------------------------------
INSERT INTO rule_profiles (exam_id, version, name, option_count, marks_per_correct, penalty_wrong, penalty_unanswered, status)
VALUES (@bpsc_exam_id, 1, 'BPSC TRE 5-Option Standard Pattern (+1.0 / -0.25)', 5, 1.000, 0.250, 0.000, 'published')
ON DUPLICATE KEY UPDATE
  option_count = VALUES(option_count),
  marks_per_correct = VALUES(marks_per_correct),
  penalty_wrong = VALUES(penalty_wrong),
  status = VALUES(status);

SET @rule_id := (SELECT id FROM rule_profiles WHERE exam_id = @bpsc_exam_id AND version = 1 LIMIT 1);

-- ----------------------------------------------------------------------------
-- 4. Test Series Tracks (Classes 1-5, 6-8, 9-10, 11-12, & PYQ Papers)
-- ----------------------------------------------------------------------------
INSERT INTO test_series (exam_id, name, slug, description, access_type, status)
VALUES
  (@bpsc_exam_id, 'BPSC TRE 4.0: Classes 1–5 (Primary PRT)', 'bpsc-tre-4-primary-1-5', 'Part-I Qualifying Language (30 Qs) + Part-II General Studies (120 Qs) complete syllabus test series.', 'free', 'published'),
  (@bpsc_exam_id, 'BPSC TRE 4.0: Classes 6–8 (Middle School)', 'bpsc-tre-4-middle-6-8', 'Part-I Language + Part-II GS + Part-III Maths/Science/Social Science/Languages test series.', 'free', 'published'),
  (@bpsc_exam_id, 'BPSC TRE 4.0: Classes 9–10 (Secondary TGT)', 'bpsc-tre-4-secondary-9-10', 'Part-I Language + Part-II GS + Part-III Concerned Subject tests at graduation depth.', 'free', 'published'),
  (@bpsc_exam_id, 'BPSC TRE 4.0: Classes 11–12 (Higher Secondary PGT)', 'bpsc-tre-4-higher-secondary-11-12', 'Comprehensive full length and 80-question subject tests across 33 PGT disciplines.', 'premium', 'published'),
  (@bpsc_exam_id, 'BPSC TRE: Official Previous Year Papers (PYQ)', 'bpsc-tre-pyq-official', 'Actual TRE 1.0, TRE 2.0 & TRE 3.0 question papers in real CBT format.', 'free', 'published')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  status = VALUES(status);

-- Get Series IDs
SET @series_prm := (SELECT id FROM test_series WHERE slug = 'bpsc-tre-4-primary-1-5' LIMIT 1);
SET @series_mid := (SELECT id FROM test_series WHERE slug = 'bpsc-tre-4-middle-6-8' LIMIT 1);
SET @series_sec := (SELECT id FROM test_series WHERE slug = 'bpsc-tre-4-secondary-9-10' LIMIT 1);
SET @series_pgt := (SELECT id FROM test_series WHERE slug = 'bpsc-tre-4-higher-secondary-11-12' LIMIT 1);
SET @series_pyq := (SELECT id FROM test_series WHERE slug = 'bpsc-tre-pyq-official' LIMIT 1);

-- ----------------------------------------------------------------------------
-- 5. Subjects According to BPSC TRE Syllabus
-- ----------------------------------------------------------------------------
INSERT INTO subjects (exam_id, name, slug, sort_order)
VALUES
  (@bpsc_exam_id, 'Language (Qualifying Part-I)', 'language-qualifying', 1),
  (@bpsc_exam_id, 'General Studies (Common Part-II)', 'general-studies-common', 2),
  (@bpsc_exam_id, 'Elementary Mathematics', 'elementary-mathematics', 3),
  (@bpsc_exam_id, 'General Science', 'general-science', 4),
  (@bpsc_exam_id, 'Indian National Movement', 'indian-national-movement', 5),
  (@bpsc_exam_id, 'Geography & Environment', 'geography-environment', 6),
  (@bpsc_exam_id, 'Bihar Special GK & Current Affairs', 'bihar-special-gk', 7),
  (@bpsc_exam_id, 'Mathematics & Science (Middle 6-8)', 'maths-science-middle', 8),
  (@bpsc_exam_id, 'Social Science (Middle 6-8)', 'social-science-middle', 9),
  (@bpsc_exam_id, 'Mathematics (Secondary 9-10)', 'mathematics-secondary', 10),
  (@bpsc_exam_id, 'Science (Secondary 9-10)', 'science-secondary', 11),
  (@bpsc_exam_id, 'Social Science (Secondary 9-10)', 'social-science-secondary', 12),
  (@bpsc_exam_id, 'Computer Science (PGT 11-12)', 'computer-science-pgt', 13),
  (@bpsc_exam_id, 'Mathematics (PGT 11-12)', 'mathematics-pgt', 14),
  (@bpsc_exam_id, 'Physics (PGT 11-12)', 'physics-pgt', 15),
  (@bpsc_exam_id, 'Chemistry (PGT 11-12)', 'chemistry-pgt', 16),
  (@bpsc_exam_id, 'Botany (PGT 11-12)', 'botany-pgt', 17),
  (@bpsc_exam_id, 'Zoology (PGT 11-12)', 'zoology-pgt', 18),
  (@bpsc_exam_id, 'History (PGT 11-12)', 'history-pgt', 19),
  (@bpsc_exam_id, 'Geography (PGT 11-12)', 'geography-pgt', 20),
  (@bpsc_exam_id, 'Political Science (PGT 11-12)', 'political-science-pgt', 21),
  (@bpsc_exam_id, 'Economics (PGT 11-12)', 'economics-pgt', 22),
  (@bpsc_exam_id, 'Hindi Sahitya (PGT 11-12)', 'hindi-sahitya-pgt', 23),
  (@bpsc_exam_id, 'English Literature (PGT 11-12)', 'english-literature-pgt', 24),
  (@bpsc_exam_id, 'Accountancy & Commerce (PGT 11-12)', 'accountancy-pgt', 25),
  (@bpsc_exam_id, 'Business Studies (PGT 11-12)', 'business-studies-pgt', 26),
  (@bpsc_exam_id, 'Sociology (PGT 11-12)', 'sociology-pgt', 27),
  (@bpsc_exam_id, 'Psychology (PGT 11-12)', 'psychology-pgt', 28),
  (@bpsc_exam_id, 'Home Science (PGT 11-12)', 'home-science-pgt', 29),
  (@bpsc_exam_id, 'Physical Education (PGT 11-12)', 'physical-education-pgt', 30)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order);

-- ----------------------------------------------------------------------------
-- 6. Core BPSC TRE 4.0 Mock Tests (150-Q Full Mocks, 80-Q Subject Tests, 40-Q Topic Sprints)
-- ----------------------------------------------------------------------------
INSERT INTO tests (test_series_id, rule_profile_id, name, slug, test_type, question_count, duration_minutes, total_marks, status, description)
VALUES
  -- Primary (Classes 1-5) Full Length & Section Tests
  (@series_prm, @rule_id, 'BPSC TRE 4.0 (1–5): All-Subject Full Diagnostic Mock 01', 'bpsc-tre-4-1-5-full-mock-01', 'full', 150, 150, 150.00, 'published', 'Full-length 150-question CBT exam: 30 Language + 120 GS (Maths, Reasoning, Science, INM, Geography, Bihar GK).'),
  (@series_prm, @rule_id, 'Language (1–5): Part-I English & Hindi Sectional Test', 'primary-1-5-language-mock', 'section', 30, 30, 30.00, 'published', 'Official 30-question qualifying language simulation testing functional grammar and vocabulary.'),
  (@series_prm, @rule_id, 'Elementary Mathematics (1–5): High-Yield Practice Mock', 'primary-1-5-elementary-mathematics-mock', 'subject', 40, 40, 40.00, 'published', 'Targeted practice covering number system, decimals, percentage, profit/loss, and geometry.'),
  (@series_prm, @rule_id, 'General Studies (1–5): Complete Core GS Focus Drill', 'primary-1-5-general-studies-mock', 'subject', 40, 40, 40.00, 'published', 'Bihar GK, 1857 to 1947 Indian National Movement, General Science, and environmental ecology.'),

  -- Middle School (Classes 6-8)
  (@series_mid, @rule_id, 'BPSC TRE 4.0 (6–8): Mathematics & Science Full Mock 01', 'middle-6-8-mathematics-science-mock', 'full', 150, 150, 150.00, 'published', '150-Q CBT exam: 30 Language + 40 GS + 80 Mathematics & Science combined subject curriculum.'),
  (@series_mid, @rule_id, 'BPSC TRE 4.0 (6–8): Social Science Full Mock 01', 'middle-6-8-social-science-mock', 'full', 150, 150, 150.00, 'published', '150-Q CBT exam: 30 Language + 40 GS + 80 Social Science (History, Geography, Polity, Economics).'),

  -- Secondary TGT (Classes 9-10)
  (@series_sec, @rule_id, 'BPSC TRE 4.0 (9–10): Mathematics Full CBT Mock 01', 'secondary-9-10-mathematics-mock', 'full', 150, 150, 150.00, 'published', '150-Q CBT exam: 30 Language + 40 GS + 80 Secondary & Graduation level Mathematics.'),
  (@series_sec, @rule_id, 'BPSC TRE 4.0 (9–10): Science Full CBT Mock 01', 'secondary-9-10-science-mock', 'full', 150, 150, 150.00, 'published', '150-Q CBT exam: 30 Language + 40 GS + 80 Physics, Chemistry, and Life Sciences.'),
  (@series_sec, @rule_id, 'BPSC TRE 4.0 (9–10): Social Science Full CBT Mock 01', 'secondary-9-10-social-science-mock', 'full', 150, 150, 150.00, 'published', '150-Q CBT exam: 30 Language + 40 GS + 80 Social Science (World History, Indian Polity, Geography).'),

  -- Higher Secondary PGT (Classes 11-12)
  (@series_pgt, @rule_id, 'BPSC TRE 4.0 (11–12): All-Subject Full Diagnostic Mock 01', 'bpsc-tre-4-11-12-full-mock-01', 'full', 150, 150, 150.00, 'published', 'Full-length 150-Q CBT diagnostic mock with Part-I Language (30 Qs), Part-II GS (40 Qs), and Part-III Subject (80 Qs).'),
  (@series_pgt, @rule_id, 'BPSC TRE 4.0 (11–12): Core Foundation Mock (Language + GS)', 'bpsc-tre-4-11-12-common-foundation-mock', 'section', 70, 70, 70.00, 'published', 'Mandatory common papers for all 33 PGT streams: 30 Qualifying Language + 40 General Studies.'),
  (@series_pgt, @rule_id, 'Computer Science (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-computer-science-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 CS (Python/C++, DSA, DBMS, SQL, Computer Networks, OS, Cyber Security).'),
  (@series_pgt, @rule_id, 'Mathematics (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-mathematics-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Advanced Mathematics (Calculus, Vectors, Coordinate Geometry, Algebra).'),
  (@series_pgt, @rule_id, 'Physics (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-physics-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Senior Physics (Mechanics, Thermodynamics, Electromagnetism, Modern Physics).'),
  (@series_pgt, @rule_id, 'Chemistry (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-chemistry-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Chemistry (Physical, Inorganic, Organic, Biomolecules).'),
  (@series_pgt, @rule_id, 'History (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-history-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 History (Ancient, Medieval, Modern Freedom Movement, Bihar History).'),
  (@series_pgt, @rule_id, 'Geography (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-geography-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Geography (Geomorphology, Climatology, Indian Physiography, Resources).'),
  (@series_pgt, @rule_id, 'Political Science (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-political-science-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Political Science (Constitutional Framework, Governance, Political Thought).'),
  (@series_pgt, @rule_id, 'Economics (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-economics-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Economics (Micro, Macro, Indian Economic Policy, Public Finance).'),
  (@series_pgt, @rule_id, 'Hindi Sahitya (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-hindi-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 Hindi Sahitya (Vyakaran, Sahitya Ka Itihas, Kavyashastra).'),
  (@series_pgt, @rule_id, 'English Literature (11–12): Full Length CBT Mock 01', 'bpsc-tre-4-11-12-english-full-mock-01', 'full', 150, 150, 150.00, 'published', '150 Qs: 30 Language + 40 GS + 80 English Literature & Advanced Linguistics.'),

  -- Official PYQs
  (@series_pyq, @rule_id, 'BPSC TRE 3.0 (Official Paper): General Studies & Language', 'bpsc-tre-3-official-paper-gs-lang', 'pyq', 150, 150, 150.00, 'published', 'Official examination paper of BPSC TRE 3.0 re-exam conducted in 2024 with authentic answer key.')
ON DUPLICATE KEY UPDATE
  test_series_id = VALUES(test_series_id),
  name = VALUES(name),
  question_count = VALUES(question_count),
  duration_minutes = VALUES(duration_minutes),
  total_marks = VALUES(total_marks),
  status = VALUES(status),
  description = VALUES(description);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT
  e.name AS exam,
  ts.name AS test_series,
  COUNT(t.id) AS total_mock_tests
FROM exams e
JOIN test_series ts ON ts.exam_id = e.id
LEFT JOIN tests t ON t.test_series_id = ts.id
WHERE e.slug = 'bpsc-tre-4'
GROUP BY e.name, ts.name;
