export type SeoCheckItem = {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  maxScore: number;
  impact: "high" | "medium" | "low";
  recommendation: string;
};

export type SeoAnalysisResult = {
  overallScore: number;
  grade: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  gradeColor: string;
  wordCount: number;
  readingTimeMinutes: number;
  keywordDensityPercent: number;
  checks: SeoCheckItem[];
};

export function analyzeBlogSeo(params: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  focusKeyword: string;
  featuredImage?: string;
  videoUrl?: string;
}): SeoAnalysisResult {
  const { title = "", slug = "", excerpt = "", content = "", focusKeyword = "", featuredImage = "", videoUrl = "" } = params;

  const rawKeyword = focusKeyword.trim().toLowerCase();
  const rawTitle = title.trim();
  const rawExcerpt = excerpt.trim();
  const rawContent = content.trim();

  // Word count & reading time
  const cleanText = rawContent
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*`~_>\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Keyword occurrences
  let keywordOccurrences = 0;
  let keywordDensityPercent = 0;
  if (rawKeyword && wordCount > 0) {
    const escapedKeyword = rawKeyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");
    const matches = cleanText.match(regex);
    keywordOccurrences = matches ? matches.length : 0;
    keywordDensityPercent = Number(((keywordOccurrences / wordCount) * 100).toFixed(2));
  }

  const checks: SeoCheckItem[] = [];

  // 1. Focus Keyword presence
  const hasFocusKeyword = rawKeyword.length >= 2;
  checks.push({
    id: "focus_keyword_set",
    label: "Focus Keyword Defined",
    passed: hasFocusKeyword,
    score: hasFocusKeyword ? 10 : 0,
    maxScore: 10,
    impact: "high",
    recommendation: hasFocusKeyword
      ? `Targeting keyword: "${rawKeyword}"`
      : "Specify a primary search keyword (e.g., 'BPSC TRE 4.0 Preparation Strategy') to anchor your SEO score.",
  });

  // 2. Title Length (40 to 65 characters optimal for Google SERP)
  const titleLen = rawTitle.length;
  const isTitleLenOptimal = titleLen >= 35 && titleLen <= 70;
  checks.push({
    id: "title_length",
    label: `Title Length (${titleLen} characters)`,
    passed: isTitleLenOptimal,
    score: isTitleLenOptimal ? 10 : titleLen >= 20 ? 6 : 0,
    maxScore: 10,
    impact: "high",
    recommendation: isTitleLenOptimal
      ? "Title length is optimal for Google desktop and mobile search snippets."
      : titleLen < 35
      ? "Title is too short. Expand it to 40-65 characters to provide complete context."
      : "Title exceeds 70 characters and will likely be truncated on Google SERPs.",
  });

  // 3. Focus Keyword in Title
  const isKeywordInTitle = rawKeyword ? rawTitle.toLowerCase().includes(rawKeyword) : false;
  checks.push({
    id: "keyword_in_title",
    label: "Keyword in Title",
    passed: isKeywordInTitle,
    score: isKeywordInTitle ? 15 : 0,
    maxScore: 15,
    impact: "high",
    recommendation: isKeywordInTitle
      ? "Great job! Focus keyword appears directly in the H1 title."
      : `Include "${rawKeyword || "your focus keyword"}" near the beginning of your title.`,
  });

  // 4. Clean & SEO-Friendly Slug
  const isCleanSlug =
    slug.length >= 5 &&
    /^[a-z0-9-]+$/.test(slug) &&
    (!rawKeyword || slug.includes(rawKeyword.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")));
  checks.push({
    id: "slug_seo",
    label: "SEO-Friendly URL Slug",
    passed: isCleanSlug,
    score: isCleanSlug ? 10 : 4,
    maxScore: 10,
    impact: "medium",
    recommendation: isCleanSlug
      ? "URL slug is clean, lowercase, hyphenated, and keyword-aligned."
      : "Ensure the slug uses only lowercase letters, numbers, hyphens, and contains the focus keyword.",
  });

  // 5. Meta Description / Excerpt (120 to 160 characters)
  const excerptLen = rawExcerpt.length;
  const isExcerptOptimal = excerptLen >= 110 && excerptLen <= 165;
  checks.push({
    id: "meta_description_length",
    label: `Meta Description Length (${excerptLen} characters)`,
    passed: isExcerptOptimal,
    score: isExcerptOptimal ? 10 : excerptLen >= 60 ? 5 : 0,
    maxScore: 10,
    impact: "high",
    recommendation: isExcerptOptimal
      ? "Meta description length is ideal for Google search snippets (120-160 chars)."
      : excerptLen < 110
      ? "Meta description is too brief. Expand to 120-160 characters with an enticing call to action."
      : "Meta description exceeds 165 characters. Shorten it slightly to prevent truncation.",
  });

  // 6. Keyword in Meta Description
  const isKeywordInExcerpt = rawKeyword ? rawExcerpt.toLowerCase().includes(rawKeyword) : false;
  checks.push({
    id: "keyword_in_excerpt",
    label: "Keyword in Meta Description",
    passed: isKeywordInExcerpt,
    score: isKeywordInExcerpt ? 10 : 0,
    maxScore: 10,
    impact: "medium",
    recommendation: isKeywordInExcerpt
      ? "Focus keyword appears in the meta description."
      : `Mention "${rawKeyword || "your focus keyword"}" naturally in your meta description.`,
  });

  // 7. Content Depth & Length
  const isLongForm = wordCount >= 800;
  const isComprehensive = wordCount >= 1200;
  checks.push({
    id: "content_length",
    label: `Content Depth (${wordCount} words)`,
    passed: isLongForm,
    score: isComprehensive ? 15 : isLongForm ? 12 : wordCount >= 400 ? 7 : 2,
    maxScore: 15,
    impact: "high",
    recommendation: isComprehensive
      ? "Outstanding depth! 1200+ words signal comprehensive authority to Google algorithms."
      : isLongForm
      ? "Solid length (800+ words). Adding another case study or syllabus breakdown could boost it to 1200+."
      : "Content is below 800 words. In-depth exam guides usually need 1000+ words to rank on Page 1.",
  });

  // 8. Keyword in First 100 Words
  const first100Words = words.slice(0, 100).join(" ").toLowerCase();
  const isKeywordInIntro = rawKeyword ? first100Words.includes(rawKeyword) : false;
  checks.push({
    id: "keyword_in_intro",
    label: "Keyword in Introduction (First 100 Words)",
    passed: isKeywordInIntro,
    score: isKeywordInIntro ? 5 : 0,
    maxScore: 5,
    impact: "medium",
    recommendation: isKeywordInIntro
      ? "Focus keyword is introduced early in the opening paragraph."
      : `Mention "${rawKeyword || "your focus keyword"}" within the first 100 words so Google immediately grasps context.`,
  });

  // 9. Heading Structure (H2 / H3 tags)
  const hasH2 = /<h2\b|##\s+/i.test(rawContent);
  const hasH3 = /<h3\b|###\s+/i.test(rawContent);
  const hasHeadings = hasH2;
  checks.push({
    id: "heading_hierarchy",
    label: "Semantic Subheadings (H2 / H3)",
    passed: hasHeadings,
    score: hasH2 && hasH3 ? 5 : hasH2 ? 3 : 0,
    maxScore: 5,
    impact: "medium",
    recommendation: hasH2 && hasH3
      ? "Proper heading hierarchy detected (H2 and H3 subtopics)."
      : hasH2
      ? "Good H2 headings found. You can add granular H3 sections for even better scannability."
      : "No subheadings found. Break your article into clear H2 and H3 sections.",
  });

  // 10. Visual Media & Video Embeds
  const hasFeaturedImage = !!featuredImage.trim();
  const hasVideo = !!videoUrl.trim() || /youtube\.com|youtu\.be|<iframe/i.test(rawContent);
  const mediaPassed = hasFeaturedImage;
  checks.push({
    id: "media_richness",
    label: "Rich Media (Featured Image & Video)",
    passed: mediaPassed,
    score: hasFeaturedImage && hasVideo ? 5 : hasFeaturedImage ? 4 : hasVideo ? 2 : 0,
    maxScore: 5,
    impact: "medium",
    recommendation: hasFeaturedImage && hasVideo
      ? "Superb! Both high-resolution featured image and video embed are attached."
      : hasFeaturedImage
      ? "Featured image attached. Adding an educational YouTube lecture or video breakdown will further boost dwell time."
      : "Upload or specify a featured image to generate high-CTR Google Discover cards.",
  });

  // 11. Keyword Density (Ideal: 0.8% - 2.5%)
  const isDensityOptimal = Boolean(rawKeyword) && keywordDensityPercent >= 0.7 && keywordDensityPercent <= 2.8;
  checks.push({
    id: "keyword_density",
    label: `Keyword Density (${keywordDensityPercent}%)`,
    passed: Boolean(isDensityOptimal),
    score: isDensityOptimal ? 5 : rawKeyword && keywordDensityPercent > 0 ? 3 : 0,
    maxScore: 5,
    impact: "low",
    recommendation: isDensityOptimal
      ? `Keyword density (${keywordDensityPercent}%) is natural and avoids keyword stuffing.`
      : keywordDensityPercent > 2.8
      ? `Keyword density (${keywordDensityPercent}%) is slightly high. Replace some exact matches with synonyms to prevent over-optimization.`
      : `Keyword density (${keywordDensityPercent}%) is low. Weave the target phrase naturally a few more times into subheadings or body copy.`,
  });

  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const overallScore = Math.min(100, Math.max(0, totalScore));

  let grade: "Excellent" | "Good" | "Needs Improvement" | "Poor" = "Poor";
  let gradeColor = "#ef4444";
  if (overallScore >= 85) {
    grade = "Excellent";
    gradeColor = "#059669";
  } else if (overallScore >= 70) {
    grade = "Good";
    gradeColor = "#2563eb";
  } else if (overallScore >= 50) {
    grade = "Needs Improvement";
    gradeColor = "#d97706";
  }

  return {
    overallScore,
    grade,
    gradeColor,
    wordCount,
    readingTimeMinutes,
    keywordDensityPercent,
    checks,
  };
}
