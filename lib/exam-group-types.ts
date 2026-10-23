export type ExamGroupType = "group" | "individual";

export type ExamGroup = {
  id: string;
  slug: string;
  title: string;
  type: ExamGroupType;
  examSlug: string;
  examName: string;
  targetSubject?: string;
  clubbedSubjects: string[];
  includedTestSlugs?: string[];
  price: number;
  validityDays: number;
  description: string;
  badge?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
};

// Seed default exam groups covering both Option 1 (Full Exam Bundles) and Option 2 (Individual Subject Series with clubbed subjects)
export const defaultExamGroups: ExamGroup[] = [
  // ==========================================
  // OPTION 1: COMPLETE EXAM GROUPS / BUNDLES
  // ==========================================
  {
    id: "eg-bpsc-all",
    slug: "bpsc-tre-4-all",
    title: "BPSC TRE 4.0 (Teaching Recruitment Exam) - All-Subject Mega Pass",
    type: "group",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "All Subjects",
    clubbedSubjects: [
      "All Subjects",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "Computer Science",
      "Mathematics",
      "Elementary Mathematics",
      "Physics",
      "Chemistry",
      "Botany",
      "Zoology",
      "History",
      "Geography",
      "Political Science",
      "Economics",
      "Hindi",
      "English",
      "Accountancy",
      "General Science",
    ],
    price: 499,
    validityDays: 90,
    description: "Complete full-access pass for BPSC TRE 4.0. Unlocks all 150+ full-length CBT mocks, qualifying language papers, GS foundation tests, and all subject tracks (Classes 1–12 PRT, TGT & PGT).",
    badge: "⭐ Complete Exam Bundle",
    active: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-stet-all",
    slug: "bihar-stet-all",
    title: "Bihar STET 2026 (Secondary Teacher Eligibility) - Complete Pass",
    type: "group",
    examSlug: "bihar-stet",
    examName: "Bihar STET 2026",
    targetSubject: "All Subjects",
    clubbedSubjects: [
      "All Subjects",
      "Paper I (Secondary)",
      "Paper II (Higher Secondary)",
      "Art of Teaching & Other Skills",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer Science",
      "Hindi",
      "English",
    ],
    price: 499,
    validityDays: 90,
    description: "All-in-one preparation pass for Bihar STET 2026. Includes Paper I (Secondary 9–10) and Paper II (Higher Secondary 11–12) with Art of Teaching & all subject full mocks.",
    badge: "⚡ All-In-One STET Pass",
    active: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-ctet-all",
    slug: "ctet-all",
    title: "CTET Paper I & II (Central Teacher Eligibility) - Complete Pass",
    type: "group",
    examSlug: "ctet",
    examName: "CTET July 2026",
    targetSubject: "All Subjects",
    clubbedSubjects: [
      "All Subjects",
      "Paper I (Classes 1-5)",
      "Paper II (Classes 6-8)",
      "Child Development & Pedagogy",
      "Mathematics",
      "Environmental Studies",
      "Science",
      "Social Studies",
      "Language I",
      "Language II",
    ],
    price: 499,
    validityDays: 90,
    description: "Comprehensive CTET test series package covering Paper 1 (Primary) and Paper 2 (Upper Primary Maths/Science and Social Studies) with latest NCERT based mocks.",
    badge: "✨ Complete CTET Pack",
    active: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-railway-all",
    slug: "railway-all",
    title: "Railway RRB (NTPC & Group D) - Complete Test Series Pass",
    type: "group",
    examSlug: "railway",
    examName: "Railway RRB 2026",
    targetSubject: "All Subjects",
    clubbedSubjects: [
      "All Subjects",
      "Mathematics",
      "General Intelligence & Reasoning",
      "General Awareness",
      "General Science",
    ],
    price: 499,
    validityDays: 90,
    description: "Complete test series bundle for Indian Railways recruitment examinations covering RRB NTPC Stage 1 & 2 and Group D CBT full mocks.",
    badge: "🚆 Complete RRB Pack",
    active: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },

  // =========================================================================
  // OPTION 2: INDIVIDUAL EXAMS (CLUBBED MULTIPLE SUBJECTS IN A SINGLE SERIES)
  // =========================================================================
  {
    id: "eg-bpsc-cs",
    slug: "bpsc-tre-4-computer-science",
    title: "BPSC TRE 4.0 - Computer Science",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "Computer Science",
    clubbedSubjects: [
      "Computer Science",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "Elementary Mathematics",
      "General Science",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-computer-science-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
      "bpsc-tre-4-general-studies",
    ],
    price: 299,
    validityDays: 90,
    description: "Specially clubbed test series for Computer Science (Classes 11–12 PGT). Includes Qualifying Language + General Studies / GK-GS + Core Computer Science (Python/C++, Data Structures, DBMS, SQL, Networks, OS).",
    badge: "🔥 Highest Enrolled",
    active: true,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-bpsc-hindi",
    slug: "bpsc-tre-4-hindi",
    title: "BPSC TRE 4.0 - Hindi Language & Literature",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "Hindi",
    clubbedSubjects: [
      "Hindi",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "Elementary Mathematics",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-hindi-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
    ],
    price: 299,
    validityDays: 90,
    description: "Complete clubbed series for Hindi (Classes 9–10 & 11–12). Includes Part-I Qualifying Language + Part-II General Studies + Part-III Hindi Sahitya, Vyakaran & Kavya Shastra.",
    badge: "📚 Top Choice",
    active: true,
    sortOrder: 11,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-bpsc-math",
    slug: "bpsc-tre-4-mathematics",
    title: "BPSC TRE 4.0 - Mathematics",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "Mathematics",
    clubbedSubjects: [
      "Mathematics",
      "Elementary Mathematics",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "General Science",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-mathematics-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
    ],
    price: 299,
    validityDays: 90,
    description: "Clubbed test series for Secondary & Higher Secondary Mathematics. Includes Qualifying Language + Common GS Paper + Advanced Mathematics (Calculus, Algebra, Coordinate Geometry, Vectors).",
    badge: "📐 Popular",
    active: true,
    sortOrder: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-bpsc-social",
    slug: "bpsc-tre-4-social-science",
    title: "BPSC TRE 4.0 - Social Science (History, Geography, Polity)",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "History",
    clubbedSubjects: [
      "History",
      "Geography",
      "Political Science",
      "Economics",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-history-full-mock-01",
      "bpsc-tre-4-11-12-geography-full-mock-01",
      "bpsc-tre-4-11-12-political-science-full-mock-01",
      "bpsc-tre-4-11-12-economics-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
    ],
    price: 299,
    validityDays: 90,
    description: "Full clubbed pack for Social Science aspirants. Includes Qualifying Language + GS/GK + Indian History, Geography, Polity & Economics full CBT mocks.",
    badge: "🏛️ Essential Pack",
    active: true,
    sortOrder: 13,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-bpsc-science",
    slug: "bpsc-tre-4-science",
    title: "BPSC TRE 4.0 - Science (Physics, Chemistry, Life Sciences)",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "Physics",
    clubbedSubjects: [
      "Physics",
      "Chemistry",
      "Botany",
      "Zoology",
      "General Science",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "Elementary Mathematics",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-physics-full-mock-01",
      "bpsc-tre-4-11-12-chemistry-full-mock-01",
      "bpsc-tre-4-11-12-botany-full-mock-01",
      "bpsc-tre-4-11-12-zoology-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
    ],
    price: 299,
    validityDays: 90,
    description: "Complete Science test series combo. Includes Qualifying Language + Common GS Paper + Physics, Chemistry, Botany & Zoology full mocks.",
    badge: "🔬 High Value",
    active: true,
    sortOrder: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-bpsc-english",
    slug: "bpsc-tre-4-english",
    title: "BPSC TRE 4.0 - English Language & Literature",
    type: "individual",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    targetSubject: "English",
    clubbedSubjects: [
      "English",
      "Language (Qualifying)",
      "General Studies & Language",
      "General Studies",
      "Elementary Mathematics",
    ],
    includedTestSlugs: [
      "bpsc-tre-4-11-12-english-full-mock-01",
      "bpsc-tre-4-11-12-common-foundation-mock",
    ],
    price: 299,
    validityDays: 90,
    description: "Clubbed test series for English Literature & Grammar. Includes Qualifying Language + General Studies + English Literature Prescribed Syllabus.",
    badge: "📖 Comprehensive",
    active: true,
    sortOrder: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-stet-math",
    slug: "bihar-stet-mathematics",
    title: "Bihar STET - Mathematics (Paper 1 & 2)",
    type: "individual",
    examSlug: "bihar-stet",
    examName: "Bihar STET 2026",
    targetSubject: "Mathematics",
    clubbedSubjects: [
      "Mathematics",
      "Paper I (Secondary)",
      "Paper II (Higher Secondary)",
      "Art of Teaching & Other Skills",
    ],
    price: 299,
    validityDays: 90,
    description: "Clubbed test series for STET Mathematics. Includes Art of Teaching (50 marks) + Subject Mathematics (100 marks) full 150-Q CBT mocks.",
    badge: "📐 Popular",
    active: true,
    sortOrder: 16,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-stet-cs",
    slug: "bihar-stet-computer-science",
    title: "Bihar STET - Computer Science",
    type: "individual",
    examSlug: "bihar-stet",
    examName: "Bihar STET 2026",
    targetSubject: "Computer Science",
    clubbedSubjects: [
      "Computer Science",
      "Paper II (Higher Secondary)",
      "Art of Teaching & Other Skills",
    ],
    price: 299,
    validityDays: 90,
    description: "Clubbed series for STET Paper II Computer Science. Includes 50 marks Art of Teaching & Reasoning + 100 marks Computer Science CBT mocks.",
    badge: "💻 Tech Track",
    active: true,
    sortOrder: 17,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-ctet-p1",
    slug: "ctet-paper-1",
    title: "CTET - Paper 1 (Primary Classes 1–5)",
    type: "individual",
    examSlug: "ctet",
    examName: "CTET July 2026",
    targetSubject: "Paper 1",
    clubbedSubjects: [
      "Paper I (Classes 1-5)",
      "Child Development & Pedagogy",
      "Mathematics",
      "Environmental Studies",
      "Language I",
      "Language II",
    ],
    price: 299,
    validityDays: 90,
    description: "Full clubbed pack for CTET Paper 1. Includes CDP (30 Qs), Maths (30 Qs), EVS (30 Qs), Hindi (30 Qs) and English (30 Qs).",
    badge: "👶 Primary TET",
    active: true,
    sortOrder: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "eg-ctet-p2",
    slug: "ctet-paper-2-maths-science",
    title: "CTET - Paper 2 (Maths & Science Upper Primary)",
    type: "individual",
    examSlug: "ctet",
    examName: "CTET July 2026",
    targetSubject: "Paper 2",
    clubbedSubjects: [
      "Paper II (Classes 6-8)",
      "Child Development & Pedagogy",
      "Mathematics",
      "Science",
      "Language I",
      "Language II",
    ],
    price: 299,
    validityDays: 90,
    description: "Clubbed pack for CTET Paper 2 Mathematics & Science. Includes CDP + 60 Qs Maths/Science + Language papers.",
    badge: "🔬 Upper Primary",
    active: true,
    sortOrder: 19,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Access Evaluation Engine (Pure logic - safe for both client and server)
 */
export function evaluateTestAccess(
  user: {
    role?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: string;
    targetExamSlug?: string | null;
    targetExamName?: string | null;
  } | null,
  test: {
    access?: string;
    examSlug?: string;
    examName?: string;
    exam?: string;
    subjectName?: string;
    subject?: string;
    slug?: string;
  },
  examGroups: ExamGroup[] = defaultExamGroups
): { hasAccess: boolean; isFree: boolean; reason?: string } {
  // Free test is accessible to everyone
  if (test.access === "Free") {
    return { hasAccess: true, isFree: true };
  }

  // If not logged in
  if (!user) {
    return { hasAccess: false, isFree: false, reason: "Login required to access this premium mock test." };
  }

  // Admin and Staff roles have universal access
  if (user.role === "admin" || user.role === "editor") {
    return { hasAccess: true, isFree: false };
  }

  // Check subscription expiration
  const isExpired = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).getTime() < Date.now()
    : false;

  if (isExpired || user.subscriptionStatus !== "active") {
    return {
      hasAccess: false,
      isFree: false,
      reason: isExpired ? "Your subscription pass has expired. Please renew to continue." : "Active subscription required.",
    };
  }

  // Ultimate VIP Pass unlocks all tests
  if (user.subscriptionTier === "ultimate") {
    return { hasAccess: true, isFree: false };
  }

  // Single Sprint / Exam Pass
  if (user.subscriptionTier === "sprint") {
    const userSlug = (user.targetExamSlug || "").toLowerCase().trim();
    const userExamName = (user.targetExamName || "").toLowerCase().trim();
    const testExamSlug = (test.examSlug || (test.exam || "").toLowerCase().replace(/[^a-z0-9]/g, "")).toLowerCase().trim();
    const testSubject = (test.subjectName || test.subject || "").toLowerCase().trim();
    const testSlug = (test.slug || "").toLowerCase().trim();

    // 1. Look for matching Exam Group
    const matchedGroup = examGroups.find(
      (g) =>
        g.slug.toLowerCase() === userSlug ||
        g.id.toLowerCase() === userSlug ||
        (userExamName && g.title.toLowerCase().includes(userExamName)) ||
        (userExamName && userExamName.includes(g.title.toLowerCase()))
    );

    if (matchedGroup) {
      const groupExamSlug = matchedGroup.examSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanTestExamSlug = testExamSlug.replace(/[^a-z0-9]/g, "");

      // Verify exam category matches
      const examMatches =
        groupExamSlug.includes(cleanTestExamSlug) ||
        cleanTestExamSlug.includes(groupExamSlug);

      if (!examMatches) {
        return {
          hasAccess: false,
          isFree: false,
          reason: `Your pass is for ${matchedGroup.title}. It does not grant access to ${test.examName || test.exam || "this exam"}.`,
        };
      }

      // If it's a Complete Exam Group Bundle (Option 1): ALL subjects in this exam are unlocked!
      if (matchedGroup.type === "group") {
        return { hasAccess: true, isFree: false };
      }

      // If it's an Individual Exam Series (Option 2): Check clubbed subjects & included tests!
      if (matchedGroup.type === "individual") {
        // Direct test slug match
        if (matchedGroup.includedTestSlugs && matchedGroup.includedTestSlugs.some((s) => s.toLowerCase() === testSlug)) {
          return { hasAccess: true, isFree: false };
        }

        // Clubbed subject match
        const clubbedLower = matchedGroup.clubbedSubjects.map((s) => s.toLowerCase().trim());
        const subjectMatches = clubbedLower.some(
          (sub) =>
            sub === testSubject ||
            testSubject.includes(sub) ||
            sub.includes(testSubject) ||
            (sub.includes("language") && testSubject.includes("language")) ||
            (sub.includes("general studies") && testSubject.includes("general studies")) ||
            (sub.includes("general science") && testSubject.includes("science"))
        );

        if (subjectMatches) {
          return { hasAccess: true, isFree: false };
        }

        // Test belongs to same exam, but different subject! (Negative case)
        return {
          hasAccess: false,
          isFree: false,
          reason: `This test is part of the "${test.subjectName || test.subject}" subject series. Your pass unlocks the "${matchedGroup.title}" series with its clubbed subjects.`,
        };
      }
    }

    // 2. Fallback legacy comparison if no ExamGroup found
    const cleanUserSlug = userSlug.replace(/[^a-z0-9]/g, "");
    const cleanTestExamSlug = testExamSlug.replace(/[^a-z0-9]/g, "");

    if (cleanUserSlug && cleanTestExamSlug && (cleanUserSlug.includes(cleanTestExamSlug) || cleanTestExamSlug.includes(cleanUserSlug))) {
      return { hasAccess: true, isFree: false };
    }
  }

  return {
    hasAccess: false,
    isFree: false,
    reason: "This test requires an active Exam Pass or Ultimate VIP Pass.",
  };
}
