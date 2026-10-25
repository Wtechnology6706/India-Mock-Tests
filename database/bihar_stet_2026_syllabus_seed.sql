-- ============================================================================
-- BIHAR STET 2026 COMPLETE SYLLABUS & EXAM SEED SQL SCRIPT
-- Database: mock_test_platform
-- Conducting Body: Bihar School Examination Board (BSEB)
-- Official Reference: BSEB STET 2026 Syllabus & Exam Pattern (Paper 1 & Paper 2)
-- Structure: 150 MCQs | 150 Minutes | No Negative Marking
--   * Unit 1: Specific Subject Knowledge (100 Questions / 100 Marks)
--   * Unit 2: Teaching Art (30 Qs) + Other Skills (20 Qs) = 50 Marks (Common)
-- ============================================================================

USE mock_test_platform;

-- 1. Ensure Country, Sector, Category & BSEB Organization
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
SELECT id, 'Bihar School Examination Board', 'bseb', 'https://secondary.biharboardonline.com' FROM countries WHERE code = 'IN' LIMIT 1
ON DUPLICATE KEY UPDATE name = VALUES(name), official_url = VALUES(official_url);

-- ----------------------------------------------------------------------------
-- 2. Master Bihar STET 2026 Exam Record
-- ----------------------------------------------------------------------------
INSERT INTO exams (country_id, category_id, organization_id, name, slug, description, status, badge, visual_tone, visual_symbol, image_url)
SELECT
  c.id, cat.id, org.id,
  'Bihar STET 2026',
  'bihar-stet',
  'Bihar Secondary Teacher Eligibility Test (STET 2026) conducted by BSEB for Secondary (Classes 9–10 / Paper 1) and Senior Secondary (Classes 11–12 / Paper 2). Features 150 MCQs (100 Subject + 50 Art of Teaching & Other Skills), 150 minutes, and No Negative Marking.',
  'published',
  'Trending',
  'blue',
  '◒',
  '/uploads/taxonomy/bihar-stet-cover-1792847814675.png'
FROM countries c
JOIN categories cat ON cat.slug = 'teaching'
JOIN organizations org ON org.slug = 'bseb'
WHERE c.code = 'IN'
ON DUPLICATE KEY UPDATE
  name = 'Bihar STET 2026',
  description = VALUES(description),
  status = 'published',
  badge = VALUES(badge),
  visual_tone = 'blue',
  visual_symbol = '◒',
  image_url = VALUES(image_url);

-- Session variable for Bihar STET Exam ID
SET @stet_exam_id := (SELECT id FROM exams WHERE slug = 'bihar-stet' LIMIT 1);

-- ----------------------------------------------------------------------------
-- 3. Official BSEB STET Scoring Rule Profile (150 Marks, No Negative Marking)
-- ----------------------------------------------------------------------------
INSERT INTO rule_profiles (exam_id, version, name, option_count, marks_per_correct, penalty_wrong, penalty_unanswered, status)
VALUES (@stet_exam_id, 1, 'Bihar STET Official Pattern (150 MCQs / No Negative Marking)', 4, 1.000, 0.000, 0.000, 'published')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  option_count = VALUES(option_count),
  marks_per_correct = VALUES(marks_per_correct),
  penalty_wrong = VALUES(penalty_wrong),
  penalty_unanswered = VALUES(penalty_unanswered),
  status = VALUES(status);

SET @stet_rule_id := (SELECT id FROM rule_profiles WHERE exam_id = @stet_exam_id AND version = 1 LIMIT 1);

-- ----------------------------------------------------------------------------
-- 4. Test Series Tracks (Paper 1, Paper 2, Common Unit-2, Clubbed Sets, & PYQ)
-- ----------------------------------------------------------------------------
INSERT INTO test_series (exam_id, name, slug, description, access_type, status)
VALUES
  (
    @stet_exam_id,
    'Bihar STET 2026: Paper I (Classes 9–10 Secondary TGT)',
    'bihar-stet-paper-1-secondary',
    'Full-length 150-question CBT mocks for Secondary Teacher aspirants (Classes 9-10): 100 marks Graduation-level Subject Knowledge + 50 marks Common Unit 2 (Art of Teaching & Other Skills).',
    'free',
    'published'
  ),
  (
    @stet_exam_id,
    'Bihar STET 2026: Paper II (Classes 11–12 Senior Secondary PGT)',
    'bihar-stet-paper-2-senior',
    'Complete 150-question CBT mocks for Senior Secondary Teacher aspirants (Classes 11-12): 100 marks Post-Graduation Honours Subject Knowledge + 50 marks Common Unit 2 across 27 disciplines.',
    'premium',
    'published'
  ),
  (
    @stet_exam_id,
    'Bihar STET 2026: Common Unit-2 Master Series (50 Marks)',
    'bihar-stet-common-unit2',
    'Targeted drills on mandatory Unit 2 for all Paper 1 and Paper 2 candidates: 30 marks Art of Teaching (Bloom\'s taxonomy, lesson planning, pedagogy) + 20 marks Other Skills (GK, Reasoning, Maths, EVS).',
    'free',
    'published'
  ),
  (
    @stet_exam_id,
    'Bihar STET 2026: Clubbed Multi-Subject & Foundation Series',
    'bihar-stet-clubbed-sets',
    'Combined multidisciplinary mock tests (Maths + Science, Social Sciences, Language Bundles) designed for holistic scoring and topic-level mastery.',
    'free',
    'published'
  ),
  (
    @stet_exam_id,
    'Bihar STET: Official Previous Year Question Papers (PYQ)',
    'bihar-stet-pyq-official',
    'Authentic BSEB STET CBT examination question papers from previous editions with official answer keys and step-by-step solutions.',
    'free',
    'published'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  status = VALUES(status);

-- Get Series IDs
SET @stet_series_p1  := (SELECT id FROM test_series WHERE slug = 'bihar-stet-paper-1-secondary' LIMIT 1);
SET @stet_series_p2  := (SELECT id FROM test_series WHERE slug = 'bihar-stet-paper-2-senior' LIMIT 1);
SET @stet_series_u2  := (SELECT id FROM test_series WHERE slug = 'bihar-stet-common-unit2' LIMIT 1);
SET @stet_series_clb := (SELECT id FROM test_series WHERE slug = 'bihar-stet-clubbed-sets' LIMIT 1);
SET @stet_series_pyq := (SELECT id FROM test_series WHERE slug = 'bihar-stet-pyq-official' LIMIT 1);

-- ----------------------------------------------------------------------------
-- 5. Subjects According to Bihar STET 2026 Syllabus
-- ----------------------------------------------------------------------------
INSERT INTO subjects (exam_id, name, slug, sort_order)
VALUES
  -- Common Unit 2 Subjects
  (@stet_exam_id, 'Art of Teaching (शिक्षण कला)', 'art-of-teaching', 1),
  (@stet_exam_id, 'General Knowledge (सामान्य ज्ञान)', 'stet-general-knowledge', 2),
  (@stet_exam_id, 'Environmental Science (पर्यावरण विज्ञान)', 'stet-environmental-science', 3),
  (@stet_exam_id, 'Mathematical Aptitude (गणितीय योग्यता)', 'stet-mathematical-aptitude', 4),
  (@stet_exam_id, 'Logical Reasoning (तार्किक क्षमता)', 'stet-logical-reasoning', 5),

  -- Paper 1 (Classes 9-10) Subjects
  (@stet_exam_id, 'Hindi (Paper I · Classes 9-10)', 'hindi-paper-1', 6),
  (@stet_exam_id, 'English (Paper I · Classes 9-10)', 'english-paper-1', 7),
  (@stet_exam_id, 'Mathematics (Paper I · Classes 9-10)', 'mathematics-paper-1', 8),
  (@stet_exam_id, 'Science (Physics, Chemistry, Biology · Paper 1)', 'science-paper-1', 9),
  (@stet_exam_id, 'Social Science (History, Geography, Polity, Economics · Paper 1)', 'social-science-paper-1', 10),
  (@stet_exam_id, 'Urdu (Paper I · Classes 9-10)', 'urdu-paper-1', 11),
  (@stet_exam_id, 'Sanskrit (Paper I · Classes 9-10)', 'sanskrit-paper-1', 12),
  (@stet_exam_id, 'Physical Education (Paper I · Classes 9-10)', 'physical-education-paper-1', 13),

  -- Paper 2 (Classes 11-12) Subjects
  (@stet_exam_id, 'Computer Science (Paper II · Subject Code 226)', 'computer-science-paper-2', 14),
  (@stet_exam_id, 'Mathematics (Paper II · Classes 11-12)', 'mathematics-paper-2', 15),
  (@stet_exam_id, 'Physics (Paper II · Classes 11-12)', 'physics-paper-2', 16),
  (@stet_exam_id, 'Chemistry (Paper II · Classes 11-12)', 'chemistry-paper-2', 17),
  (@stet_exam_id, 'Zoology (Paper II · Classes 11-12)', 'zoology-paper-2', 18),
  (@stet_exam_id, 'Botany (Paper II · Classes 11-12)', 'botany-paper-2', 19),
  (@stet_exam_id, 'History (Paper II · Classes 11-12)', 'history-paper-2', 20),
  (@stet_exam_id, 'Geography (Paper II · Classes 11-12)', 'geography-paper-2', 21),
  (@stet_exam_id, 'Political Science (Paper II · Classes 11-12)', 'political-science-paper-2', 22),
  (@stet_exam_id, 'Economics (Paper II · Classes 11-12)', 'economics-paper-2', 23),
  (@stet_exam_id, 'Sociology (Paper II · Classes 11-12)', 'sociology-paper-2', 24),
  (@stet_exam_id, 'Psychology (Paper II · Classes 11-12)', 'psychology-paper-2', 25),
  (@stet_exam_id, 'Home Science (Paper II · Classes 11-12)', 'home-science-paper-2', 26),
  (@stet_exam_id, 'Commerce & Accountancy (Paper II · Classes 11-12)', 'commerce-paper-2', 27),
  (@stet_exam_id, 'Business Studies (Paper II · Classes 11-12)', 'business-studies-paper-2', 28),
  (@stet_exam_id, 'Hindi Sahitya (Paper II · Classes 11-12)', 'hindi-sahitya-paper-2', 29),
  (@stet_exam_id, 'English Literature (Paper II · Classes 11-12)', 'english-literature-paper-2', 30),
  (@stet_exam_id, 'Urdu Literature (Paper II · Classes 11-12)', 'urdu-literature-paper-2', 31),
  (@stet_exam_id, 'Sanskrit Sahitya (Paper II · Classes 11-12)', 'sanskrit-sahitya-paper-2', 32)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order);

-- ----------------------------------------------------------------------------
-- 6. Core Bihar STET 2026 Mock Tests (Full Mocks, Clubbed Sets, Unit-2 Drills, PYQs)
-- ----------------------------------------------------------------------------
INSERT INTO tests (test_series_id, rule_profile_id, name, slug, test_type, question_count, duration_minutes, total_marks, status, description)
VALUES
  -- -------------------------------------------------------------
  -- COMMON UNIT-2 MASTER & TOPIC DRILLS (50 MARKS / MANDATORY)
  -- -------------------------------------------------------------
  (
    @stet_series_u2,
    @stet_rule_id,
    'Bihar STET 2026: Common Unit-2 Full Diagnostic Mock 01 (Art of Teaching + Other Skills)',
    'stet-2026-unit2-common-paper-mock-01',
    'section',
    50,
    50,
    50.00,
    'published',
    'Official 50-question mandatory Unit-2 paper for both Paper 1 & Paper 2: 30 Qs on Art of Teaching (Bloom\'s Taxonomy, lesson plans, teaching methods, evaluation) + 20 Qs on Other Skills (Bihar GK, Reasoning, Maths & EVS).'
  ),
  (
    @stet_series_u2,
    @stet_rule_id,
    'Unit-2 Part A: Art of Teaching (शिक्षण कला) 30-Question Mastery Drill',
    'stet-2026-unit2-art-of-teaching-sprint',
    'topic',
    30,
    30,
    30.00,
    'published',
    'Focused 30-question drill on teaching-learning processes, Bloom\'s taxonomy, microteaching, classroom management, CCE, and educational psychology.'
  ),
  (
    @stet_series_u2,
    @stet_rule_id,
    'Unit-2 Part B: Other Skills (GK, Maths, Reasoning & EVS) 20-Question Sprint',
    'stet-2026-unit2-other-skills-sprint',
    'topic',
    20,
    20,
    20.00,
    'published',
    'Speed drill of 20 high-scoring questions: 5 General Knowledge (Bihar history & geography), 5 Environmental Science, 5 Numerical Aptitude, and 5 Logical Reasoning.'
  ),

  -- -------------------------------------------------------------
  -- CLUBBED MULTI-SUBJECT & FOUNDATION EXAM SETS
  -- -------------------------------------------------------------
  (
    @stet_series_clb,
    @stet_rule_id,
    'Bihar STET Paper 1: Clubbed Science & Mathematics Foundation Set (100 Qs)',
    'stet-2026-paper1-maths-science-clubbed',
    'subject',
    100,
    100,
    100.00,
    'published',
    'Comprehensive 100-question clubbed set combining graduation-level Secondary Mathematics (50 Qs) and Integrated Science (Physics, Chemistry, Biology - 50 Qs).'
  ),
  (
    @stet_series_clb,
    @stet_rule_id,
    'Bihar STET Paper 1: Clubbed Social Science Integrated Marathon (100 Qs)',
    'stet-2026-paper1-social-science-clubbed',
    'subject',
    100,
    100,
    100.00,
    'published',
    'Integrated 100-question Social Studies paper covering Ancient/Modern History (25 Qs), Physical/Indian Geography (25 Qs), Indian Polity & Constitution (25 Qs), and Economy (25 Qs).'
  ),
  (
    @stet_series_clb,
    @stet_rule_id,
    'Bihar STET: Dual-Paper Foundation Language Diagnostic Mock (English + Hindi 100 Qs)',
    'stet-2026-clubbed-language-master-mock',
    'subject',
    100,
    100,
    100.00,
    'published',
    'Clubbed 100-question language exam: 50 Questions Hindi Vyakaran & Sahitya + 50 Questions English Grammar, Comprehension & Literary devices.'
  ),

  -- -------------------------------------------------------------
  -- PAPER 1 (CLASSES 9-10 SECONDARY TGT) - FULL 150-Q CBT MOCKS
  -- -------------------------------------------------------------
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Mathematics (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-mathematics-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Maths: 100 Qs Secondary & Graduation Mathematics (Algebra, Coordinate Geometry, Trigonometry, Calculus, Mensuration) + 50 Qs Common Unit-2 (Art of Teaching & Other Skills).'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Science (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-science-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Science: 100 Qs Physics, Chemistry & Biology + 50 Qs Common Unit-2 (Art of Teaching, GK, Reasoning, Maths, EVS).'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Social Science (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-social-science-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Social Science: 100 Qs History, Geography, Political Science & Economics + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Hindi (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-hindi-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Hindi: 100 Qs Hindi Grammar, Literature history, Prose & Poetry + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: English (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-english-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT English: 100 Qs Grammar, Vocabulary, Literary Analysis & Comprehension + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Urdu (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-urdu-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Urdu: 100 Qs Urdu Qawaid, Nazm, Ghazal & Dastan + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Sanskrit (Classes 9–10) Full Length CBT Mock 01',
    'stet-2026-paper1-sanskrit-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for TGT Sanskrit: 100 Qs Sanskrit Vyakaran, Sandhi, Samas & Sahitya + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p1,
    @stet_rule_id,
    'Bihar STET Paper 1: Physical Education (Classes 9–10) Full Length Mock 01',
    'stet-2026-paper1-physical-education-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock: 100 Qs Human Anatomy, Sports Psychology, Rules of Games & Yoga + 50 Qs Common Unit-2.'
  ),

  -- -------------------------------------------------------------
  -- PAPER 2 (CLASSES 11-12 SENIOR SECONDARY PGT) - FULL 150-Q CBT MOCKS
  -- -------------------------------------------------------------
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Computer Science (Subject Code 226) Full Length CBT Mock 01',
    'stet-2026-paper2-computer-science-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for STET Code 226: 100 Qs Post-Grad CS (Python/C++, Data Structures, RDBMS/SQL, Computer Networks, OS, Web Tech & Cyber Security) + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Mathematics (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-mathematics-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Maths: 100 Qs Higher Mathematics (Calculus, Linear Algebra, Real Analysis, Differential Equations, Vectors & Probability) + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Physics (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-physics-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Physics: 100 Qs Classical Mechanics, Electrodynamics, Thermodynamics, Quantum Physics, Optics & Solid State + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Chemistry (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-chemistry-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Chemistry: 100 Qs Physical, Inorganic, Organic Chemistry & Spectroscopy + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Zoology (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-zoology-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Zoology: 100 Qs Animal Diversity, Physiology, Molecular Genetics, Evolution & Immunology + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Botany (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-botany-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Botany: 100 Qs Plant Diversity, Morphology, Physiology, Plant Biotechnology & Ecology + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: History (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-history-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT History: 100 Qs Ancient India, Medieval Sultanate & Mughals, Modern National Movement, World History & Bihar History + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Geography (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-geography-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Geography: 100 Qs Geomorphology, Climatology, Human Geography, Economic Geography & Bihar Geography + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Political Science (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-political-science-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Political Science: 100 Qs Political Theory, Indian Constitution, Public Administration & International Relations + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Economics (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-economics-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Economics: 100 Qs Micro, Macro, Development Economics, Money & Banking, Indian Economy & Public Finance + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Sociology (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-sociology-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Sociology: 100 Qs Sociological Concepts, Indian Social Structure, Caste, Family, Kinship & Social Change + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Psychology (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-psychology-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Psychology: 100 Qs Cognitive Processes, Personality Assessment, Psychological Testing, Social Psychology & Mental Health + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Home Science (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-home-science-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Home Science: 100 Qs Food & Nutrition, Human Development, Resource Management & Textiles + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Commerce & Accountancy (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-commerce-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Commerce: 100 Qs Advanced Financial Accounting, Partnership, Company Accounts, Auditing & Income Tax + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Business Studies (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-business-studies-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Business Studies: 100 Qs Principles of Management, Financial Markets, Marketing & Business Environment + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: Hindi Sahitya (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-hindi-sahitya-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT Hindi: 100 Qs Hindi Sahitya Ka Itihas (Aadikal to Aadhunik Kaal), Kavyashastra, Natak, Nibandh & Vyakaran + 50 Qs Common Unit-2.'
  ),
  (
    @stet_series_p2,
    @stet_rule_id,
    'Bihar STET Paper 2: English Literature (Classes 11–12) Full Length CBT Mock 01',
    'stet-2026-paper2-english-literature-full-mock-01',
    'full',
    150,
    150,
    150.00,
    'published',
    'Complete 150-question CBT mock for PGT English: 100 Qs History of English Literature, Major Literary Movements, Poetry, Drama, Criticism & Advanced Linguistics + 50 Qs Common Unit-2.'
  ),

  -- -------------------------------------------------------------
  -- OFFICIAL STET PREVIOUS YEAR PAPERS (PYQ)
  -- -------------------------------------------------------------
  (
    @stet_series_pyq,
    @stet_rule_id,
    'Bihar STET 2024 (Official CBT Paper): Paper 1 Social Science',
    'bihar-stet-2024-p1-social-science-official',
    'pyq',
    150,
    150,
    150.00,
    'published',
    'Actual examination paper conducted by BSEB in STET 2024: 100 Qs Social Science + 50 Qs Teaching Art & Other Skills with official answer key.'
  ),
  (
    @stet_series_pyq,
    @stet_rule_id,
    'Bihar STET 2024 (Official CBT Paper): Paper 2 Computer Science (Code 226)',
    'bihar-stet-2024-p2-computer-science-official',
    'pyq',
    150,
    150,
    150.00,
    'published',
    'Official examination paper for PGT Computer Science (Subject Code 226) conducted by BSEB in 2024 with verified solutions and answer key.'
  ),
  (
    @stet_series_pyq,
    @stet_rule_id,
    'Bihar STET 2024 (Official CBT Paper): Paper 1 Mathematics',
    'bihar-stet-2024-p1-mathematics-official',
    'pyq',
    150,
    150,
    150.00,
    'published',
    'Official BSEB CBT question paper for Secondary Teacher eligibility: 100 Qs Mathematics + 50 Qs Teaching Art & General Aptitude.'
  )
ON DUPLICATE KEY UPDATE
  test_series_id = VALUES(test_series_id),
  name = VALUES(name),
  question_count = VALUES(question_count),
  duration_minutes = VALUES(duration_minutes),
  total_marks = VALUES(total_marks),
  status = VALUES(status),
  description = VALUES(description);

-- ============================================================================
-- VERIFICATION QUERY FOR BIHAR STET 2026
-- ============================================================================
SELECT
  e.name AS exam,
  ts.name AS test_series,
  COUNT(t.id) AS total_mock_tests
FROM exams e
JOIN test_series ts ON ts.exam_id = e.id
LEFT JOIN tests t ON t.test_series_id = ts.id
WHERE e.slug = 'bihar-stet'
GROUP BY e.name, ts.name;
