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

export type SiteConfiguration = {
  portalName: string;
  portalTagline: string;
  contactEmail: string;
  supportPhone: string;
  adsenseClientId: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  razorpayEnabled?: boolean;
  mockTestMenu: SubMenuLayer2[];
  tutorialMenu: SubMenuLayer2[];
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

export const defaultSiteConfig: SiteConfiguration = {
  portalName: "Northstar",
  portalTagline: "India's Premier Examination & Mock Test Practice Platform",
  contactEmail: "support@northstar.edu.in",
  supportPhone: "+91 (0612) 234-5678",
  adsenseClientId: "",
  mockTestMenu: defaultMockTestMenu,
  tutorialMenu: defaultTutorialMenu,
};
