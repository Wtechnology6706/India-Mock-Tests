export type SubMenuItem3 = {
  id: string;
  name: string;
  slug: string;
  audience?: string;
  targetUrl: string; // If empty or isConfigured is false, it will be non-clickable
  isConfigured: boolean;
};

export type SubMenuLayer2 = {
  id: string;
  label: string;
  slug: string;
  targetUrl?: string;
  items: SubMenuItem3[];
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string; // e.g. "BPSC TRE Selected Teacher (Class 9-10)" or "Parent of CTET Qualified Aspirant"
  type: "student" | "parent";
  avatarText?: string;
  avatarUrl?: string;
  rating: number; // 1 to 5
  content: string; // Testimonial story
  examBadge?: string; // e.g. "BPSC TRE 3.0", "CTET", "Bihar STET"
  verified?: boolean;
  date?: string;
};

export type CustomNavSubItem = {
  id: string;
  label: string;
  targetUrl: string;
  audience?: string;
  badgeText?: string;
};

export type CustomNavItem = {
  id: string;
  label: string;
  linkType: "page" | "exam" | "mock-test" | "pyq" | "custom";
  targetUrl: string;
  badgeText?: string;
  isExternal?: boolean;
  order?: number;
  subItems?: CustomNavSubItem[];
};

export type SiteConfiguration = {
  portalName: string;
  portalTagline: string;
  logoImageUrl?: string;
  logoText?: string;
  contactEmail: string;
  supportPhone: string;
  adsenseClientId: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  razorpayEnabled?: boolean;
  razorpayTestMode?: boolean; // Toggle between test and live mode
  razorpayTestKeyId?: string;
  razorpayTestKeySecret?: string;
  razorpayLiveKeyId?: string;
  razorpayLiveKeySecret?: string;
  mockTestMenu: SubMenuLayer2[];
  tutorialMenu: SubMenuLayer2[];
  testimonials: TestimonialItem[];
  customNavMenu?: CustomNavItem[];
};

export const defaultMockTestMenu: SubMenuLayer2[] = [
  {
    id: "bpsc-tre-4",
    label: "BPSC TRE 4.0",
    slug: "bpsc-tre-4",
    targetUrl: "/exams/bpsc-tre-4",
    items: [
      { id: "bpsc-1-5", name: "Class 1–5", slug: "primary-1-5", audience: "Primary Teacher", targetUrl: "/exams/bpsc-tre-4#primary-1-5", isConfigured: true },
      { id: "bpsc-6-8", name: "Class 6–8", slug: "middle-6-8", audience: "Middle School Teacher", targetUrl: "/exams/bpsc-tre-4#middle-6-8", isConfigured: true },
      { id: "bpsc-9-10", name: "Class 9–10", slug: "secondary-9-10", audience: "Secondary Teacher (TGT)", targetUrl: "/exams/bpsc-tre-4#secondary-9-10", isConfigured: true },
      { id: "bpsc-11-12", name: "Class 11–12", slug: "higher-secondary-11-12", audience: "Higher Secondary (PGT)", targetUrl: "/exams/bpsc-tre-4#higher-secondary-11-12", isConfigured: true },
    ],
  },
  {
    id: "bihar-stet",
    label: "STET",
    slug: "bihar-stet",
    targetUrl: "/exams/bihar-stet",
    items: [
      { id: "stet-1-5", name: "Class 1–5", slug: "paper-1-primary", audience: "Paper I (Primary Foundation)", targetUrl: "/tracks/bihar-stet/paper-1-primary", isConfigured: true },
      { id: "stet-6-8", name: "Class 6–8", slug: "paper-1-middle", audience: "Paper I (Upper Primary)", targetUrl: "/tracks/bihar-stet/paper-1-middle", isConfigured: true },
      { id: "stet-9-10", name: "Class 9–10", slug: "paper-1", audience: "Paper I (Secondary)", targetUrl: "/exams/bihar-stet#paper-1", isConfigured: true },
      { id: "stet-11-12", name: "Class 11–12", slug: "paper-2", audience: "Paper II (Higher Secondary)", targetUrl: "/exams/bihar-stet#paper-2", isConfigured: true },
    ],
  },
  {
    id: "btet",
    label: "BTET",
    slug: "btet",
    targetUrl: "/exams",
    items: [
      { id: "btet-1-5", name: "Class 1–5", slug: "paper-1", audience: "Paper I (Primary Level)", targetUrl: "/tracks/btet/paper-1", isConfigured: true },
      { id: "btet-6-8", name: "Class 6–8", slug: "paper-2", audience: "Paper II (Upper Primary)", targetUrl: "/tracks/btet/paper-2", isConfigured: true },
      { id: "btet-9-10", name: "Class 9–10", slug: "paper-3", audience: "Secondary Foundation", targetUrl: "/tracks/btet/paper-3", isConfigured: true },
      { id: "btet-11-12", name: "Class 11–12", slug: "paper-4", audience: "Senior Secondary", targetUrl: "", isConfigured: false },
    ],
  },
  {
    id: "ctet",
    label: "CTET",
    slug: "ctet",
    targetUrl: "/exams/ctet",
    items: [
      { id: "ctet-1-5", name: "Class 1–5", slug: "paper-1", audience: "Paper I (Classes 1 to 5)", targetUrl: "/exams/ctet#paper-1", isConfigured: true },
      { id: "ctet-6-8", name: "Class 6–8", slug: "paper-2", audience: "Paper II (Classes 6 to 8)", targetUrl: "/exams/ctet#paper-2", isConfigured: true },
      { id: "ctet-9-10", name: "Class 9–10", slug: "secondary-prep", audience: "Secondary Practice", targetUrl: "/tracks/ctet/secondary-prep", isConfigured: true },
      { id: "ctet-11-12", name: "Class 11–12", slug: "senior-prep", audience: "Senior Secondary Practice", targetUrl: "", isConfigured: false },
    ],
  },
];

export const defaultTutorialMenu: SubMenuLayer2[] = [
  {
    id: "tet",
    label: "TET",
    slug: "tet",
    items: [
      { id: "tut-ctet", name: "CTET", slug: "ctet", audience: "Central Board Preparation", targetUrl: "/tutorials/tet/ctet", isConfigured: true },
      { id: "tut-stet", name: "STET", slug: "stet", audience: "State Eligibility Concepts", targetUrl: "/tutorials/tet/stet", isConfigured: true },
      { id: "tut-bpsc", name: "BPSC TRE", slug: "bpsc-tre", audience: "Teacher Recruitment Masterclass", targetUrl: "/tutorials/tet/bpsc-tre", isConfigured: true },
      { id: "tut-ugc", name: "UGC NET", slug: "ugc-net", audience: "National Eligibility Lectures", targetUrl: "/tutorials/tet/ugc-net", isConfigured: true },
    ],
  },
  {
    id: "technical",
    label: "Technical Tutorial",
    slug: "technical",
    items: [
      { id: "tut-prog", name: "Programming", slug: "programming", audience: "Python, C++, Java, JS", targetUrl: "/tutorials/technical/programming", isConfigured: true },
      { id: "tut-cloud", name: "Cloud Computing", slug: "cloud-computing", audience: "AWS, Azure, GCP", targetUrl: "/tutorials/technical/cloud-computing", isConfigured: true },
      { id: "tut-devops", name: "DevOps & CI/CD", slug: "devops", audience: "Docker, Kubernetes, Linux", targetUrl: "/tutorials/technical/devops", isConfigured: true },
      { id: "tut-dsa", name: "DSA & Algorithms", slug: "dsa", audience: "Problem Solving Mastery", targetUrl: "/tutorials/technical/dsa", isConfigured: true },
    ],
  },
  {
    id: "cbse",
    label: "CBSE & ICSE",
    slug: "cbse-icse",
    items: [
      { id: "tut-cbse-10", name: "Class 10 Board", slug: "cbse-10", audience: "Science & Mathematics", targetUrl: "/tutorials/cbse-icse/cbse-10", isConfigured: true },
      { id: "tut-cbse-12", name: "Class 12 Board", slug: "cbse-12", audience: "Physics, Chem, Maths, Bio", targetUrl: "/tutorials/cbse-icse/cbse-12", isConfigured: true },
      { id: "tut-icse-10", name: "ICSE Class 10", slug: "icse-10", audience: "Board Concept Series", targetUrl: "/tutorials/cbse-icse/icse-10", isConfigured: true },
    ],
  },
  {
    id: "govt",
    label: "Govt & SSC",
    slug: "govt-ssc",
    items: [
      { id: "tut-ssc-cgl", name: "SSC CGL", slug: "ssc-cgl", audience: "Tier I & Tier II Video Notes", targetUrl: "/tutorials/govt-ssc/ssc-cgl", isConfigured: true },
      { id: "tut-railway", name: "Railway NTPC", slug: "railway-ntpc", audience: "CBT 1 & 2 GK/Maths", targetUrl: "/tutorials/govt-ssc/railway-ntpc", isConfigured: true },
      { id: "tut-bank-po", name: "Banking PO & Clerk", slug: "bank-po", audience: "Reasoning & Quant Mastery", targetUrl: "/tutorials/govt-ssc/bank-po", isConfigured: true },
    ],
  },
];

export const defaultTestimonials: TestimonialItem[] = [
  {
    id: "testi-1",
    name: "Pooja Kumari",
    role: "Selected Secondary Teacher (Class 9-10)",
    type: "student",
    rating: 5,
    content: "The exact 5-option CBT format and bilingual explanations matched the actual BPSC TRE examination perfectly. Attempting 15 full mocks boosted my time management and helped me secure Rank 42 in Mathematics.",
    examBadge: "BPSC TRE 3.0 Qualified",
    verified: true,
    date: "August 2026",
  },
  {
    id: "testi-2",
    name: "Rajeshwar Sharma",
    role: "Parent of BPSC TRE Aspirant (Ankit Sharma)",
    type: "parent",
    rating: 5,
    content: "As a parent, seeing my son analyze his weak subjects with detailed scorecards and chapter-wise breakdowns gave us immense confidence. The platform is transparent, authentic, and truly syllabus-focused.",
    examBadge: "Parent Review",
    verified: true,
    date: "July 2026",
  },
  {
    id: "testi-3",
    name: "Amit Kumar Sinha",
    role: "CTET Paper 1 & 2 Cleared (Score 128/150)",
    type: "student",
    rating: 5,
    content: "Child Development & Pedagogy (CDP) questions were strictly based on previous year trends and NCERT/SCERT guidelines. The instant rank analysis gave me real exam simulation experience.",
    examBadge: "CTET Qualified",
    verified: true,
    date: "September 2026",
  },
  {
    id: "testi-4",
    name: "Sunita Devi",
    role: "Parent of STET Paper 1 Aspirant (Kavita)",
    type: "parent",
    rating: 5,
    content: "India Mock Tests provided the most affordable and structured test series. The daily practice tracker and instant solution keys helped my daughter crack Bihar STET in her very first attempt.",
    examBadge: "Parent Review",
    verified: true,
    date: "June 2026",
  },
  {
    id: "testi-5",
    name: "Vikash Ranjan",
    role: "Bihar STET (Computer Science PGT) Qualified",
    type: "student",
    rating: 5,
    content: "The technical topic-wise tests for Python, DBMS, and Networking covered every single subtopic. Solutions with code snippets and explanation notes are the best in the market.",
    examBadge: "STET PGT Qualified",
    verified: true,
    date: "September 2026",
  },
  {
    id: "testi-6",
    name: "Manoj Kumar Verma",
    role: "Parent of BPSC Primary Teacher Aspirant",
    type: "parent",
    rating: 5,
    content: "Great platform with genuine syllabus mapping. No confusing advertisements or distractions. My daughter was able to practice on both phone and laptop seamlessly.",
    examBadge: "Parent Review",
    verified: true,
    date: "May 2026",
  },
];

export const defaultSiteConfig: SiteConfiguration = {
  portalName: "India Mock Tests",
  portalTagline: "India's Premier Examination & Mock Test Practice Platform",
  logoImageUrl: "",
  logoText: "India Mock Tests",
  contactEmail: "support@indiamocktests.com",
  supportPhone: "+91 98765 43210",
  adsenseClientId: "",
  razorpayEnabled: true,
  razorpayTestMode: true,
  razorpayTestKeyId: "",
  razorpayTestKeySecret: "",
  razorpayLiveKeyId: "",
  razorpayLiveKeySecret: "",
  mockTestMenu: defaultMockTestMenu,
  tutorialMenu: defaultTutorialMenu,
  testimonials: defaultTestimonials,
  customNavMenu: [],
};
