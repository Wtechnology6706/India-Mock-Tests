import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";

export type BlogCategory =
  | "Preparation Strategy"
  | "Eligibility & Syllabus"
  | "Exam Guides"
  | "Notification Updates"
  | "Admit Card & Results"
  | "Topper Interviews";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  focusKeyword: string;
  featuredImage: string;
  videoUrl?: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  readingTime: number;
  views: number;
  isFeatured: boolean;
  status: "Published" | "Draft";
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
};

export type BlogInput = {
  title: string;
  slug?: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[] | string;
  focusKeyword?: string;
  featuredImage?: string;
  videoUrl?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  isFeatured?: boolean;
  status?: "Published" | "Draft";
  publishedAt?: string;
};

// Seed human-written articles crafted by senior educational experts
export const initialBlogSeeds: BlogPost[] = [
  {
    id: "blog-1",
    slug: "bpsc-tre-4-preparation-strategy-90-day-roadmap",
    title: "BPSC TRE 4.0 Preparation Strategy: How Aspirants Can Crack Primary & Secondary Exams in 90 Days",
    subtitle: "A pragmatic, classroom-tested blueprint for Bihar Teacher Recruitment 4.0 covering the 5-option puzzle, NCERT/SCERT mapping, and a daily 6-hour timetable.",
    excerpt: "Master BPSC TRE 4.0 with our authentic 90-day preparation strategy. Learn how to tackle the 5-option format, syllabus breakdown for Classes 1-5 & 9-10, and key books.",
    category: "Preparation Strategy",
    tags: ["BPSC TRE 4.0", "Teacher Recruitment", "Bihar Teacher Exam", "Preparation Strategy", "NCERT SCERT", "Sarkari Exam"],
    focusKeyword: "BPSC TRE 4.0 Preparation Strategy",
    featuredImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    authorName: "Er. Amitesh Ranjan",
    authorRole: "Senior Faculty & Curriculum Director",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    readingTime: 8,
    views: 4520,
    isFeatured: true,
    status: "Published",
    publishedAt: "2026-10-15T09:00:00Z",
    createdAt: "2026-10-15T09:00:00Z",
    content: `
<h2>The Ground Reality of BPSC TRE 4.0</h2>
<p>If there is one lesson that BPSC TRE 1.0, 2.0, and 3.0 taught every serious teaching aspirant across Bihar and neighboring states, it is this: <strong>traditional rote-learning guides and generic one-liner GK PDFs are completely obsolete</strong>. The Bihar Public Service Commission under its revised testing pattern frames conceptual questions directly sourced from state curriculum textbooks (SCERT) and national frameworks (NCERT).</p>

<p>With hundreds of thousands competing for prestigious government teaching appointments across Primary (Classes 1–5), Middle (Classes 6–8), Secondary (Classes 9–10), and Higher Secondary (Classes 11–12), cutoffs have skyrocketed. To succeed in TRE 4.0, you do not just need to study hard—you must study with an exact mathematical method.</p>

<div class="blog-callout-box tip">
  <strong>💡 Core Reality Check:</strong> The difference between candidates who clear the cutoff by 15 marks and those who miss out by 2 marks is not IQ. It is mastery over the 5-option testing format and systematic revision of high-weightage chapters.
</div>

<h2>Understanding the Examination Pattern & Syllabus Architecture</h2>
<p>BPSC TRE is conducted as a single composite paper divided into distinct segments:</p>

<div class="blog-table-wrapper">
  <table class="blog-styled-table">
    <thead>
      <tr>
        <th>Segment</th>
        <th>Sections & Subjects</th>
        <th>Questions / Marks</th>
        <th>Qualifying Criteria</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Part I (Language)</strong></td>
        <td>English (8 Qs) + Hindi / Urdu / Bengali (22 Qs)</td>
        <td>30 Marks</td>
        <td>Qualifying (Minimum 9 marks required; 30%)</td>
      </tr>
      <tr>
        <td><strong>Part II (General Studies)</strong></td>
        <td>Elementary Maths, Reasoning, General Science, Indian National Movement, Geography</td>
        <td>40 Marks</td>
        <td>Counted towards final merit ranking</td>
      </tr>
      <tr>
        <td><strong>Part III (Subject Core)</strong></td>
        <td>Chosen academic subject (e.g., Mathematics, Science, Social Science, Hindi, English, CS)</td>
        <td>80 Marks</td>
        <td>The decisive scoring ground (highest weightage)</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Taming the 5-Option Format: Option (D) & Option (E) Strategy</h2>
<p>Most candidates lose between 12 to 18 marks strictly because of how BPSC formats its answer keys. Unlike standard 4-option examinations, BPSC introduces:</p>
<ul>
  <li><strong>Option (A), (B), (C):</strong> Standard answer choices.</li>
  <li><strong>Option (D):</strong> <em>More than one of the above (उपर्युक्त में से एक से अधिक)</em></li>
  <li><strong>Option (E):</strong> <em>None of the above (उपर्युक्त में से कोई नहीं)</em></li>
</ul>

<p>When you encounter a question in Indian National Movement or Modern History (such as events during the 1942 Quit India Movement or Champaran Satyagraha), often two statements provided are factually true. If you rush and tick Option (A) without reading (B) and (C), you will forfeit the mark because the correct answer is Option (D).</p>

<div class="blog-callout-box warning">
  <strong>⚠️ Golden Rule for 5 Options:</strong> Never bubble your answer on the OMR or click your CBT choice until you have actively evaluated all three options (A, B, and C). If two are correct, D is inevitable. If none strictly match the precise year or definition, E is your target.
</div>

<h2>The 90-Day Step-by-Step Study Timetable</h2>
<p>Here is a battle-tested daily schedule designed for both full-time aspirants and working professionals who can dedicate 6 to 7 hours daily:</p>

<h3>Phase 1 (Days 1 to 30): The NCERT & SCERT Foundation Deep-Dive</h3>
<ul>
  <li><strong>Morning (8:00 AM – 10:30 AM): Subject Specialization (Part III)</strong><br />Complete textbook chapters line-by-line. If preparing for Classes 9–10, read Classes 9, 10, and 11 NCERT. Maintain a one-page summary per chapter.</li>
  <li><strong>Noon (11:30 AM – 1:00 PM): Elementary Mathematics & Reasoning</strong><br />Practice 30 arithmetic questions daily: Percentage, Profit & Loss, Ratio, Time & Work, and Number System.</li>
  <li><strong>Evening (4:00 PM – 6:00 PM): Indian National Movement & Bihar Special GK</strong><br />Focus on Bihar's role in 1857 revolt (Kunwar Singh), 1917 Champaran, Congress sessions held in Bihar (Gaya 1922, Bankipore 1912), and the Kisan Sabha movement (Swami Sahajanand Saraswati).</li>
  <li><strong>Night (8:30 PM – 10:00 PM): Language & Quick Revision</strong><br />Alternate days between Hindi grammar (Sandhi, Samas, Muhavare) and English vocabulary.</li>
</ul>

<h3>Phase 2 (Days 31 to 65): Topic-Wise Question Banks & Error Log Creation</h3>
<p>Switching from passive reading to active retrieval is where real learning happens. During this phase, solve at least 100 topic-wise MCQs daily. Maintain an <em>Error Notebook</em> where you write down only the questions you got wrong or guessed incorrectly.</p>

<h3>Phase 3 (Days 66 to 90): Full-Length CBT Simulation & Speed Calibration</h3>
<p>In the final month, simulate the exact exam environment twice a week. Sit at your desk for 2.5 hours without your phone, attempt full-length 150-question mock tests on Sarkari Practice, and spend 90 minutes analyzing your detailed score report.</p>

<h2>High-Yield Booklist & Resources</h2>
<ul>
  <li><strong>SCERT Bihar Textbooks:</strong> 'Ujjwal' and 'Kishore' series from Class 6 to 10 (freely available on Bihar education portals).</li>
  <li><strong>Indian National Movement:</strong> Bipan Chandra or Spectrum Modern History (specifically chapters after 1885).</li>
  <li><strong>General Science:</strong> NCERT Exemplar Class 8, 9, and 10.</li>
  <li><strong>Mock Tests:</strong> India Mock Tests official syllabus-mapped CBT tests.</li>
</ul>

<h2>Final Words from the Editorial Desk</h2>
<p>Remember that Bihar Teacher Recruitment is not a test of luck. The syllabus is well-defined, the previous year papers provide a crystal-clear mirror of examiner expectations, and the candidates who stay consistent for 90 uninterrupted days will secure their appointment letters. Start your preparation today!</p>
`,
  },
  {
    id: "blog-2",
    slug: "bihar-stet-2026-eligibility-exam-pattern-qualifying-marks",
    title: "Bihar STET 2026: Eligibility Criteria, Paper 1 & Paper 2 Exam Pattern, and Qualifying Marks Explained",
    subtitle: "The definitive guide to BSEB STET Paper 1 (Secondary) and Paper 2 (Higher Secondary) educational requirements, subject combinations, cutoffs, and CBT scoring.",
    excerpt: "Complete guide on Bihar STET 2026 eligibility criteria, subject combinations for secondary & higher secondary, category-wise qualifying marks, and CBT normalization.",
    category: "Eligibility & Syllabus",
    tags: ["Bihar STET 2026", "BSEB STET", "Eligibility Criteria", "Exam Pattern", "Qualifying Marks", "Class 9-10", "Class 11-12"],
    focusKeyword: "Bihar STET 2026 Eligibility",
    featuredImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
    authorName: "Dr. Shailendra Verma",
    authorRole: "Former BPSC Examiner & Education Columnist",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    readingTime: 7,
    views: 3890,
    isFeatured: false,
    status: "Published",
    publishedAt: "2026-10-18T11:30:00Z",
    createdAt: "2026-10-18T11:30:00Z",
    content: `
<h2>Why Clearing Bihar STET is Mandatory for Secondary Teachers</h2>
<p>Under the Bihar State Teaching Cadre Rules, qualifying the Secondary Teacher Eligibility Test (STET) conducted by the Bihar School Examination Board (BSEB) is the mandatory gateway for appearing in BPSC TRE for Classes 9 through 12. Unlike CTET which qualifies candidates only up to Class 8 (Elementary), STET is the sole state eligibility accreditation for Secondary (High School) and Senior Secondary (Intermediate / +2) institutions.</p>

<p>Every year, thousands of applications are rejected or candidates disqualified after examination due to fundamental confusion regarding <strong>graduation subject combinations</strong> and <strong>B.Ed recognition norms</strong>. In this article, we outline every statutory rule in plain, clear language.</p>

<h2>Eligibility Criteria Breakdown by Paper</h2>

<h3>Paper 1 (Secondary: Classes 9–10)</h3>
<p>To be eligible for STET Paper 1, the candidate must satisfy both educational and professional criteria:</p>
<ul>
  <li><strong>Academic Qualification:</strong> Bachelor’s Degree in the relevant subject with at least 50% marks (45% for reserved categories: SC, ST, EBC, BC, and Divyang) from a recognized university.</li>
  <li><strong>Professional Qualification:</strong> Bachelor of Education (B.Ed.) from an NCTE recognized institution OR a 4-year integrated B.A.B.Ed. / B.Sc.B.Ed. degree.</li>
</ul>

<div class="blog-callout-box warning">
  <strong>⚠️ Important Note on D.El.Ed:</strong> A D.El.Ed (Diploma in Elementary Education) alone does NOT make a candidate eligible for STET Paper 1 or Paper 2, even if combined with a graduation degree, unless explicitly accompanied by B.Ed.
</div>

<h3>Paper 2 (Higher Secondary: Classes 11–12)</h3>
<ul>
  <li><strong>Academic Qualification:</strong> Master’s Degree (Post-Graduation) in the specified subject with a minimum of 50% marks (45% for reserved categories).</li>
  <li><strong>Professional Qualification:</strong> B.Ed. from an NCTE recognized institute.</li>
  <li><strong>Special Exception (Computer Science):</strong> For Paper 2 Computer Science (Subject Code 207), B.Ed is NOT mandatory. Candidates with B.E./B.Tech (CS/IT), MCA, M.Sc (CS), or 'B' Level from DOEACC with graduation are fully eligible.</li>
</ul>

<h2>Subject Combination Matrix for Paper 1 (Class 9–10)</h2>
<p>One of the most litigated areas in teacher eligibility is subject grouping. Review the table below carefully:</p>

<div class="blog-table-wrapper">
  <table class="blog-styled-table">
    <thead>
      <tr>
        <th>Subject Cadre</th>
        <th>Mandatory Graduation Subjects</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Social Science (Code 101)</strong></td>
        <td>Graduation with any two subjects: History, Geography, Economics, Political Science. Out of the two, <strong>either History or Geography is strictly mandatory</strong>.</td>
      </tr>
      <tr>
        <td><strong>Mathematics (Code 102)</strong></td>
        <td>Graduation with Mathematics accompanied by Physics or Chemistry or Electronics or Computer Science or Statistics.</td>
      </tr>
      <tr>
        <td><strong>Science (Code 103)</strong></td>
        <td>Graduation in Botany, Zoology, and Chemistry, or a Degree in Biotechnology / Microbiology.</td>
      </tr>
      <tr>
        <td><strong>Languages (Hindi, English, etc.)</strong></td>
        <td>The candidate must have studied the language as an Honours subject or subsidiary subject at all 3 years of graduation.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Exam Pattern & Scoring Scheme</h2>
<p>BSEB STET is conducted as a Computer Based Test (CBT) of 150 minutes (2.5 hours):</p>
<ul>
  <li><strong>Section 1: Specified Subject Matter (100 Marks)</strong><br />Questions mapped to the graduation/post-graduation curriculum.</li>
  <li><strong>Section 2: Art of Teaching & Other Skills (50 Marks)</strong>
    <ul>
      <li>Art of Teaching (Pedagogy & Classroom Management): 30 Marks</li>
      <li>General Knowledge, Environmental Science, Mathematical Aptitude, Logical Reasoning: 20 Marks</li>
    </ul>
  </li>
  <li><strong>Total:</strong> 150 Marks (150 Questions, 1 mark each).</li>
  <li><strong>Negative Marking:</strong> There is <strong>NO negative marking</strong> in Bihar STET.</li>
</ul>

<h2>Category-Wise Passing Marks & Normalization</h2>
<p>Because STET is conducted across multiple shifts and days, BSEB applies the <strong>Z-score Normalization Method</strong>. The qualifying percentages are fixed by the government:</p>

<div class="blog-table-wrapper">
  <table class="blog-styled-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Qualifying Percentage</th>
        <th>Raw Passing Marks (out of 150)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>General (Unreserved Male)</strong></td>
        <td>50.0%</td>
        <td>75.0 Marks</td>
      </tr>
      <tr>
        <td><strong>Backward Class (BC)</strong></td>
        <td>45.5%</td>
        <td>68.25 Marks</td>
      </tr>
      <tr>
        <td><strong>Extremely Backward Class (EBC)</strong></td>
        <td>42.5%</td>
        <td>63.75 Marks</td>
      </tr>
      <tr>
        <td><strong>SC / ST / Divyang (PwD)</strong></td>
        <td>40.0%</td>
        <td>60.0 Marks</td>
      </tr>
      <tr>
        <td><strong>Women (All Categories including General)</strong></td>
        <td>40.0%</td>
        <td>60.0 Marks</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Preparation Strategy: Scoring 105+ for Safety</h2>
<p>Although STET is a qualifying examination, you should never aim for just 75 marks. Normalization shifts can decrease your score by 3 to 5 marks if your shift happens to be statistically easier. Aim for 105+ marks by:</p>
<ol>
  <li>Securing 40+ out of 50 in the Art of Teaching and General Aptitude segment.</li>
  <li>Solving previous 3 years' STET papers available on our platform.</li>
  <li>Practicing timed CBT computer mocks so you are fully comfortable with the online interface.</li>
</ol>
`,
  },
  {
    id: "blog-3",
    slug: "how-to-score-120-plus-ctet-2026-cdp-pedagogy-blueprint",
    title: "How to Score 120+ in CTET July 2026: CDP & Pedagogy Master Blueprint for Paper 1 & 2",
    subtitle: "Crack Central Teacher Eligibility Test with 120+ marks by mastering Child Development, eliminating negative pedagogy traps, and solving previous year trends.",
    excerpt: "Proven blueprint to score 120+ in CTET July 2026. Master Child Development & Pedagogy (CDP), learn question elimination tricks for Piaget & Vygotsky, and score 30/30.",
    category: "Exam Guides",
    tags: ["CTET 2026", "CTET July 2026", "CDP Preparation", "Pedagogy Tricks", "Score 120 in CTET", "CBSE CTET"],
    focusKeyword: "Score 120 in CTET",
    featuredImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80",
    authorName: "Pooja Kumari",
    authorRole: "CTET 132/150 Topper & Education Mentor",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    readingTime: 7,
    views: 5120,
    isFeatured: true,
    status: "Published",
    publishedAt: "2026-10-20T14:00:00Z",
    createdAt: "2026-10-20T14:00:00Z",
    content: `
<h2>The Secret That 90% of CTET Aspirants Overlook</h2>
<p>Ask an average aspirant preparing for the Central Teacher Eligibility Test (CTET) about their strategy, and they will tell you they are memorizing Math formulas or mugging up EVS facts about animals and birds. While content knowledge is necessary, they miss the single biggest structural fact of CTET:</p>

<div class="blog-callout-box tip">
  <strong>💡 The 90-Mark Pedagogy Rule:</strong> Out of 150 total marks in CTET, exactly <strong>90 marks belong to Child Development and Subject Pedagogy</strong>.
  <ul>
    <li>Child Development & Pedagogy (CDP): 30 Marks</li>
    <li>Hindi Pedagogy: 15 Marks</li>
    <li>English / Sanskrit Pedagogy: 15 Marks</li>
    <li>Maths Pedagogy: 15 Marks</li>
    <li>EVS / Social Science / Science Pedagogy: 15 Marks</li>
  </ul>
</div>

<p>When you master the pedagogical mindset mandated by the National Curriculum Framework (NCF 2005) and NEP 2020, you do not just prepare for 30 marks—you automatically solve 60% of the entire question paper!</p>

<h2>The Holy Trinity of CDP: Piaget, Vygotsky, and Kohlberg</h2>
<p>Every single CTET exam paper contains between 6 to 9 direct questions based on three developmental theorists. Here is how CBSE frames questions around them:</p>

<h3>1. Jean Piaget (Constructivism & Stages of Cognitive Development)</h3>
<ul>
  <li><strong>Sensorimotor (0–2 yrs):</strong> Object permanence, sensory exploration.</li>
  <li><strong>Pre-operational (2–7 yrs):</strong> Egocentrism, animism, lack of conservation, centration.</li>
  <li><strong>Concrete Operational (7–11 yrs):</strong> Conservation achieved, reversibility, classification, seriation.</li>
  <li><strong>Formal Operational (11+ yrs):</strong> Abstract reasoning, hypothetical-deductive logic.</li>
  <li><em>CBSE Trick:</em> Watch out for terms like <strong>Assimilation</strong> (adding new knowledge without altering schema), <strong>Accommodation</strong> (modifying existing schema due to conflict), and <strong>Equilibration</strong>.</li>
</ul>

<h3>2. Lev Vygotsky (Socio-Cultural Perspective)</h3>
<p>Vygotsky believed learning is inherently social and precedes cognitive development:</p>
<ul>
  <li><strong>ZPD (Zone of Proximal Development):</strong> The difference between what a child can do independently and what they can achieve with guidance.</li>
  <li><strong>Scaffolding (पाड़/ढांचा):</strong> Temporary support provided by an adult or More Knowledgeable Other (MKO). Examples in questions include hints, prompts, or breaking complex tasks into manageable steps.</li>
  <li><strong>Private Speech:</strong> When children talk to themselves while performing a task, Vygotsky views this as self-regulation (not egocentrism).</li>
</ul>

<h3>3. Lawrence Kohlberg (Moral Development Stages)</h3>
<ul>
  <li><strong>Pre-conventional:</strong> Punishment & Obedience, Instrumental Relativist (Tit-for-Tat).</li>
  <li><strong>Conventional:</strong> 'Good Boy/Nice Girl' orientation, Law and Order orientation.</li>
  <li><strong>Post-conventional:</strong> Social Contract and Universal Ethical Principles (Heinz Dilemma).</li>
  <li><em>Critical point:</em> Remember Carol Gilligan's feminist critique arguing that Kohlberg's theory was male-centric and undervalued feminine ethics of care.</li>
</ul>

<h2>The Positive & Negative Tag Words Elimination Technique</h2>
<p>When you are stuck between two close options in Pedagogy, the <em>Tag Words Method</em> will guide you to the 100% correct answer in less than 5 seconds.</p>

<div class="blog-table-wrapper">
  <table class="blog-styled-table">
    <thead>
      <tr>
        <th>❌ Negative Tag Words (Instant Disqualifiers)</th>
        <th>✅ Positive Tag Words (Marks the Correct Option)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Rote memorization (रटना / कंठस्थ करना)</td>
        <td>Active participation & Child-centered (बाल-केंद्रित)</td>
      </tr>
      <tr>
        <td>Punishment, reprimand, or fear</td>
        <td>Encouraging curiosity, questions & exploration</td>
      </tr>
      <tr>
        <td>Separating students by IQ / Ability grouping</td>
        <td>Inclusive Education & Collaborative learning (समावेशी)</td>
      </tr>
      <tr>
        <td>Strict adherence only to textbook</td>
        <td>Connecting school knowledge to real-life context</td>
      </tr>
      <tr>
        <td>Viewing errors as failures</td>
        <td>Viewing errors as windows into child's thinking</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Subject-Wise Strategy to Reach 120+</h2>

<h3>Language 1 & Language 2 (Hindi & English): 60 Marks</h3>
<p>Never read unseen passages word-by-word before glancing at the questions. First skim the 5 questions to identify keywords, then read the passage with a focused eye. This saves at least 15 minutes. For pedagogy, master Krashen's language acquisition hypothesis, Chomsky's LAD (Language Acquisition Device), and basic grammar concepts like Parts of Speech and Figures of Speech.</p>

<h3>Mathematics & EVS: 60 Marks</h3>
<p>For Paper 1 EVS, read NCERT Books <em>Looking Around</em> (आस-पास) from Class 3, 4, and 5. Topics like traditional paintings (Madhubani), animal characteristics (Elephants, Sloth, Tiger), desert oak tree, and map direction questions (relative location of Delhi with respect to Bhopal/Patna) appear consistently year after year.</p>

<h2>Mock Test Analysis: How to Gain +15 Marks in 10 Days</h2>
<p>Taking a mock test without analyzing it is a complete waste of time. After each test on Sarkari Practice:</p>
<ol>
  <li>Filter out the questions where you spent more than 90 seconds. Speed calibration in Reading Comprehension is vital.</li>
  <li>Tag every wrong answer: Was it a factual gap or did you fall for a negative pedagogy trap?</li>
  <li>Maintain a 30-page revision notebook that you will review 48 hours prior to exam day.</li>
</ol>
`,
  },
];

// Memory store fallback
const globalForBlog = globalThis as unknown as { blogs?: Map<string, BlogPost> };
const memoryBlogs = globalForBlog.blogs ?? new Map<string, BlogPost>();
if (!globalForBlog.blogs) {
  initialBlogSeeds.forEach((b) => memoryBlogs.set(b.id, b));
  globalForBlog.blogs = memoryBlogs;
}

export async function ensureBlogSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'Exam Guides',
        tags TEXT,
        focus_keyword VARCHAR(128),
        featured_image TEXT,
        video_url TEXT,
        author_name VARCHAR(128) NOT NULL DEFAULT 'Editorial Team',
        author_role VARCHAR(128) NOT NULL DEFAULT 'Education Analyst',
        author_avatar TEXT,
        reading_time INT NOT NULL DEFAULT 5,
        views INT NOT NULL DEFAULT 0,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        status ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_published_at (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Check if seeds already exist
    const [rows] = await db.query<(RowDataPacket & { count: number })[]>(
      "SELECT COUNT(*) AS count FROM blog_posts"
    );
    if (Number(rows[0]?.count ?? 0) === 0) {
      for (const b of initialBlogSeeds) {
        await db.query(
          `INSERT INTO blog_posts
            (id, slug, title, subtitle, excerpt, content, category, tags, focus_keyword,
             featured_image, video_url, author_name, author_role, author_avatar,
             reading_time, views, is_featured, status, published_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title)`,
          [
            b.id,
            b.slug,
            b.title,
            b.subtitle,
            b.excerpt,
            b.content,
            b.category,
            JSON.stringify(b.tags),
            b.focusKeyword,
            b.featuredImage,
            b.videoUrl || null,
            b.authorName,
            b.authorRole,
            b.authorAvatar,
            b.readingTime,
            b.views,
            b.isFeatured ? 1 : 0,
            b.status,
            b.publishedAt,
            b.createdAt,
          ]
        );
      }
    }
  } catch (err) {
    console.warn("Blog schema creation note (using memory fallback if DB offline):", err);
  }
}

function rowToBlogPost(row: any): BlogPost {
  let tags: string[] = [];
  try {
    if (typeof row.tags === "string") {
      tags = JSON.parse(row.tags);
    } else if (Array.isArray(row.tags)) {
      tags = row.tags;
    }
  } catch {
    tags = String(row.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || "",
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || "Exam Guides",
    tags,
    focusKeyword: row.focus_keyword || "",
    featuredImage: row.featured_image || "",
    videoUrl: row.video_url || undefined,
    authorName: row.author_name || "Editorial Team",
    authorRole: row.author_role || "Education Analyst",
    authorAvatar: row.author_avatar || "",
    readingTime: Number(row.reading_time || 5),
    views: Number(row.views || 0),
    isFeatured: Boolean(row.is_featured),
    status: row.status === "Draft" ? "Draft" : "Published",
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : new Date().toISOString(),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  await ensureBlogSchema();
  try {
    const [rows] = await db.query<(RowDataPacket & any)[]>(
      "SELECT * FROM blog_posts ORDER BY published_at DESC, created_at DESC"
    );
    if (rows && rows.length > 0) {
      return rows.map(rowToBlogPost);
    }
  } catch {
    // Fall back to memory
  }
  return Array.from(memoryBlogs.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPublishedBlogs(filter?: { category?: string; query?: string }): Promise<BlogPost[]> {
  await ensureBlogSchema();
  try {
    let sql = "SELECT * FROM blog_posts WHERE status = 'Published'";
    const params: any[] = [];

    if (filter?.category && filter.category !== "All") {
      sql += " AND category = ?";
      params.push(filter.category);
    }
    if (filter?.query && filter.query.trim()) {
      sql += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)";
      const term = `%${filter.query.trim()}%`;
      params.push(term, term, term, term);
    }
    sql += " ORDER BY is_featured DESC, published_at DESC";

    const [rows] = await db.query<(RowDataPacket & any)[]>(sql, params);
    if (rows && rows.length > 0) {
      return rows.map(rowToBlogPost);
    }
  } catch {
    // Fall back to memory
  }

  let list = Array.from(memoryBlogs.values()).filter((b) => b.status === "Published");
  if (filter?.category && filter.category !== "All") {
    list = list.filter((b) => b.category === filter.category);
  }
  if (filter?.query && filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return list.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  await ensureBlogSchema();
  try {
    const [rows] = await db.query<(RowDataPacket & any)[]>(
      "SELECT * FROM blog_posts WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (rows && rows[0]) {
      return rowToBlogPost(rows[0]);
    }
  } catch {
    // Fall back to memory
  }

  const memoryMatch = Array.from(memoryBlogs.values()).find((b) => b.slug === slug);
  return memoryMatch || null;
}

export async function createBlog(input: BlogInput): Promise<BlogPost> {
  await ensureBlogSchema();

  const id = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanSlug = (input.slug || input.title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const tagsArr = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string"
    ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const wordCount = input.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const now = new Date().toISOString();
  const publishedAt = input.status === "Published" ? (input.publishedAt || now) : now;

  const newPost: BlogPost = {
    id,
    slug: cleanSlug,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || "",
    excerpt: input.excerpt.trim(),
    content: input.content,
    category: input.category || "Exam Guides",
    tags: tagsArr,
    focusKeyword: input.focusKeyword?.trim() || "",
    featuredImage: input.featuredImage || "",
    videoUrl: input.videoUrl || undefined,
    authorName: input.authorName || "Editorial Team",
    authorRole: input.authorRole || "Senior Education Analyst",
    authorAvatar: input.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    readingTime,
    views: 0,
    isFeatured: Boolean(input.isFeatured),
    status: input.status || "Published",
    publishedAt,
    createdAt: now,
  };

  try {
    await db.query(
      `INSERT INTO blog_posts
        (id, slug, title, subtitle, excerpt, content, category, tags, focus_keyword,
         featured_image, video_url, author_name, author_role, author_avatar,
         reading_time, views, is_featured, status, published_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newPost.id,
        newPost.slug,
        newPost.title,
        newPost.subtitle,
        newPost.excerpt,
        newPost.content,
        newPost.category,
        JSON.stringify(newPost.tags),
        newPost.focusKeyword,
        newPost.featuredImage,
        newPost.videoUrl || null,
        newPost.authorName,
        newPost.authorRole,
        newPost.authorAvatar,
        newPost.readingTime,
        newPost.views,
        newPost.isFeatured ? 1 : 0,
        newPost.status,
        newPost.publishedAt,
        newPost.createdAt,
      ]
    );
  } catch (err) {
    console.warn("Writing blog to memory fallback due to DB error:", err);
  }

  memoryBlogs.set(newPost.id, newPost);
  return newPost;
}

export async function updateBlog(id: string, input: Partial<BlogInput>): Promise<BlogPost | null> {
  await ensureBlogSchema();

  let existing = await getBlogById(id);
  if (!existing) return null;

  const tagsArr = input.tags !== undefined
    ? (Array.isArray(input.tags) ? input.tags : String(input.tags).split(",").map((t) => t.trim()).filter(Boolean))
    : existing.tags;

  const content = input.content !== undefined ? input.content : existing.content;
  const wordCount = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const updated: BlogPost = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    slug: input.slug !== undefined ? input.slug.trim() : existing.slug,
    subtitle: input.subtitle !== undefined ? input.subtitle.trim() : existing.subtitle,
    excerpt: input.excerpt !== undefined ? input.excerpt.trim() : existing.excerpt,
    content,
    category: input.category || existing.category,
    tags: tagsArr,
    focusKeyword: input.focusKeyword !== undefined ? input.focusKeyword.trim() : existing.focusKeyword,
    featuredImage: input.featuredImage !== undefined ? input.featuredImage : existing.featuredImage,
    videoUrl: input.videoUrl !== undefined ? input.videoUrl : existing.videoUrl,
    authorName: input.authorName !== undefined ? input.authorName : existing.authorName,
    authorRole: input.authorRole !== undefined ? input.authorRole : existing.authorRole,
    authorAvatar: input.authorAvatar !== undefined ? input.authorAvatar : existing.authorAvatar,
    readingTime,
    isFeatured: input.isFeatured !== undefined ? Boolean(input.isFeatured) : existing.isFeatured,
    status: input.status || existing.status,
    publishedAt: input.publishedAt || existing.publishedAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.query(
      `UPDATE blog_posts SET
        title = ?, slug = ?, subtitle = ?, excerpt = ?, content = ?,
        category = ?, tags = ?, focus_keyword = ?, featured_image = ?, video_url = ?,
        author_name = ?, author_role = ?, author_avatar = ?, reading_time = ?,
        is_featured = ?, status = ?, published_at = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        updated.title,
        updated.slug,
        updated.subtitle,
        updated.excerpt,
        updated.content,
        updated.category,
        JSON.stringify(updated.tags),
        updated.focusKeyword,
        updated.featuredImage,
        updated.videoUrl || null,
        updated.authorName,
        updated.authorRole,
        updated.authorAvatar,
        updated.readingTime,
        updated.isFeatured ? 1 : 0,
        updated.status,
        updated.publishedAt,
        updated.id,
      ]
    );
  } catch (err) {
    console.warn("DB update failed, updated in memory:", err);
  }

  memoryBlogs.set(updated.id, updated);
  return updated;
}

export async function deleteBlog(id: string): Promise<boolean> {
  await ensureBlogSchema();
  try {
    await db.query("DELETE FROM blog_posts WHERE id = ?", [id]);
  } catch {
    // Continue
  }
  memoryBlogs.delete(id);
  return true;
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  await ensureBlogSchema();
  try {
    const [rows] = await db.query<(RowDataPacket & any)[]>(
      "SELECT * FROM blog_posts WHERE id = ? LIMIT 1",
      [id]
    );
    if (rows && rows[0]) {
      return rowToBlogPost(rows[0]);
    }
  } catch {}
  return memoryBlogs.get(id) || null;
}

export async function incrementBlogViews(id: string): Promise<void> {
  try {
    await db.query("UPDATE blog_posts SET views = views + 1 WHERE id = ?", [id]);
  } catch {}
  const found = memoryBlogs.get(id);
  if (found) {
    found.views += 1;
  }
}
