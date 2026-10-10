import Link from "next/link";
import { getFeaturedExams } from "../lib/catalog-server";
import { getSiteConfiguration } from "../lib/site-config";
import MegaMenu from "./components/MegaMenu";
import HeroSearch from "./components/HeroSearch";
import TestimonialsSection from "./components/TestimonialsSection";
import ConditionalCTA from "./components/ConditionalCTA";
import Footer from "./components/Footer";

const categories = [
  ["Teaching", "BPSC · STET · CTET · BTET", "▥", "peach", "teaching"],
  ["Civil Services", "UPSC · State PSC · BPSC Admin", "◈", "lavender", "civil"],
  ["Banking & SSC", "IBPS · SBI · CGL · CHSL", "▤", "mint", "banking"],
  ["Engineering", "GATE · JE · Technical & CS", "⌘", "sky", "engineering"],
];

export default async function Home() {
  const [config, exams] = await Promise.all([
    getSiteConfiguration(),
    getFeaturedExams(),
  ]);
  return (
    <main>
      {/* Dynamic 3-Layer Mega Menu */}
      <MegaMenu />

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> INDIA'S FOCUSED MOCK-TEST PLATFORM
          </div>
          <h1>
            Practice with purpose.<br />
            <i>Perform with confidence.</i>
          </h1>
          <p className="hero-lede">
            Realistic mock tests, clear analytics, and a smarter path to your next exam. Start with one question today.
          </p>

          {/* Interactive Working Hero Search */}
          <HeroSearch />

          <div className="hero-proof">
            <div className="proof-avatars">
              <span>AK</span>
              <span>RS</span>
              <span>PM</span>
              <b>+</b>
            </div>
            <p>
              <strong>12,000+ learners</strong>
              <br />
              practising with clarity
            </p>
          </div>
        </div>

        <div className="hero-art" aria-label="Illustration of a learner studying">
          <div className="sun-shape" />
          <div className="art-card card-score">
            <small>YOUR ACCURACY</small>
            <strong>82<span>.4%</span></strong>
            <div className="tiny-chart">
              <i /><i /><i /><i /><i />
            </div>
          </div>
          <div className="art-card card-check">
            <span>✓</span>
            <div>
              <strong>Session complete</strong>
              <small>+14 points today</small>
            </div>
          </div>
          <div className="person">
            <div className="hair" />
            <div className="head" />
            <div className="body" />
            <div className="arm" />
          </div>
          <div className="desk" />
          <div className="plant">🌿</div>
          <div className="sparkle sparkle-one">✦</div>
          <div className="sparkle sparkle-two">✧</div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip">
        <span>BUILT FOR THE WAY YOU PREPARE</span>
        <div>
          <b>Focus</b>
          <b>Progress</b>
          <b>Confidence</b>
          <b>Momentum</b>
        </div>
      </section>

      {/* Featured Exams Section */}
      <section className="section" id="exams">
        <div className="section-intro">
          <div>
            <span className="kicker">FIND YOUR STARTING POINT</span>
            <h2>
              Exams that matter<br />
              <em>to your next chapter.</em>
            </h2>
          </div>
          <Link className="text-link" href="/exams">
            Browse all exams <span>↗</span>
          </Link>
        </div>

        <div className="exam-grid">
          {exams.map((exam) => {
            const imgSrc = exam.imageUrl
              ? exam.imageUrl.startsWith("http") || exam.imageUrl.startsWith("/")
                ? exam.imageUrl
                : `/${exam.imageUrl}`
              : null;
            return (
              <article className={`exam-card ${exam.tone}`} key={exam.title}>
                <div className="exam-visual">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={exam.title}
                      className="exam-card-custom-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <>
                      <span className="exam-symbol">{exam.symbol}</span>
                      <span className="exam-badge">{exam.badge}</span>
                      <div className="ring-shape" />
                    </>
                  )}
                  {imgSrc && exam.badge && (
                    <span className="exam-badge" style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.95)", color: "#0f172a" }}>
                      {exam.badge}
                    </span>
                  )}
                </div>
                <div className="exam-body">
                  <small>{exam.meta}</small>
                  <h3>{exam.title}</h3>
                  <p>{exam.tests}<span> · </span>Free & premium</p>
                  <Link href={`/exams/${exam.slug}`}>
                    View test series <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section category-section" id="categories">
        <div className="section-intro">
          <div>
            <span className="kicker">EXPLORE BY CATEGORY</span>
            <h2>
              A better way to<br />
              <em>find your focus.</em>
            </h2>
          </div>
          <p className="section-note">
            Everything you need to practise<br />
            with intention, in one place.
          </p>
        </div>
        <div className="category-grid">
          {categories.map(([title, meta, icon, tone, slug]) => (
            <Link href={`/exams?category=${slug}`} className={`category-card ${tone}`} key={title}>
              <span className="category-icon">{icon}</span>
              <span>
                <strong>{title}</strong>
                <small>{meta}</small>
              </span>
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>

      {/* Practice Band */}
      <section className="practice-band" id="practice">
        <div className="practice-copy">
          <span className="kicker">START SMALL. GO FAR.</span>
          <h2>
            Your next best<br />
            <em>practice session.</em>
          </h2>
          <p>
            Short on time? Make the next 20 minutes count with focused tests built around the topics you need most.
          </p>
          <Link className="dark-button" href="/exams">
            Explore free tests <span>→</span>
          </Link>
        </div>
        <div className="practice-list">
          <Link href="/exams/bpsc-tre-4" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">01</div>
            <div>
              <small>QUICK PRACTICE · 20 MIN</small>
              <h3>Teaching aptitude essentials</h3>
              <p>20 questions <span>·</span> Beginner-friendly</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
          <Link href="/exams/bpsc-tre-4" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">02</div>
            <div>
              <small>PREVIOUS YEAR · 45 MIN</small>
              <h3>BPSC TRE General Studies</h3>
              <p>50 questions <span>·</span> Exam-level</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
          <Link href="/exams/bihar-stet" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">03</div>
            <div>
              <small>WEAK TOPIC · 15 MIN</small>
              <h3>Reasoning: series & patterns</h3>
              <p>15 questions <span>·</span> Personalised</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* How it Works / Analytics Feature */}
      <section className="feature-section" id="how-it-works">
        <div className="feature-image">
          <div className="feature-window">
            <div className="window-top">
              <span>India Mock Tests</span>
              <i>•••</i>
            </div>
            <div className="window-content">
              <small>WEEKLY PROGRESS</small>
              <strong>Keep going, Aspirant.</strong>
              <div className="progress-number">78<span>%</span></div>
              <div className="progress-line"><i /></div>
              <div className="progress-days">
                <span>M</span><span>T</span><span>W</span><span className="current">T</span><span>F</span><span>S</span><span>S</span>
              </div>
            </div>
          </div>
          <div className="feature-sticker">
            ✦ <span>small wins<br />add up.</span>
          </div>
        </div>
        <div className="feature-copy">
          <span className="kicker">CLARITY AFTER EVERY TEST</span>
          <h2>
            Know exactly<br />
            <em>what to do next.</em>
          </h2>
          <p>
            Not just a score. See your accuracy by subject, understand every mistake, and get a clear recommendation for your next session.
          </p>
          <div className="feature-points">
            <div>
              <span>01</span>
              <strong>Simple, honest analytics</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Weak-topic recommendations</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Progress you can feel</strong>
            </div>
          </div>
          <Link className="text-link" href="/dashboard">
            See how analytics work <span>↗</span>
          </Link>
        </div>
      </section>

      {/* Student & Parent Testimonials Section */}
      <TestimonialsSection initialTestimonials={config.testimonials} />

      {/* Final CTA */}
      <section className="final-cta">
        <span className="kicker">YOUR PREPARATION, YOUR PACE</span>
        <h2>
          Ready to make<br />
          <em>your attempt count?</em>
        </h2>
        <p>Join thousands of learners building their confidence one test at a time.</p>
        <ConditionalCTA
          loggedOutText="Create your free account"
          loggedOutHref="/register"
          loggedInText="Continue to Student Dashboard"
          loggedInHref="/dashboard"
          className="light-button"
        />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}