"use client"
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useTheme } from "@/app/providers/ThemeProvider";

const PLACEHOLDER_WORDS = [
  "Search documentation...",
  "Find tutorials...",
  "Learn DSA...",
];

function AnimatedPlaceholderInput({ className }) {
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timerId;

    const tick = () => {
      const currentWord = PLACEHOLDER_WORDS[wordIndex];
      const nextText = currentWord.slice(0, charIndex);

      if (inputRef.current) {
        inputRef.current.placeholder = nextText;
      }

      if (!isDeleting && charIndex < currentWord.length) {
        charIndex += 1;
        timerId = setTimeout(tick, 90);
        return;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        timerId = setTimeout(tick, 1000);
        return;
      }

      if (isDeleting && charIndex > 0) {
        charIndex -= 1;
        timerId = setTimeout(tick, 45);
        return;
      }

      isDeleting = false;
      wordIndex = (wordIndex + 1) % PLACEHOLDER_WORDS.length;
      timerId = setTimeout(tick, 250);
    };

    timerId = setTimeout(tick, 200);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const query = e.target.value.trim();
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={PLACEHOLDER_WORDS[0]}
      className={className}
      onKeyDown={handleSearch}
    />
  );
}

export default function Home() {
  const { isDark } = useTheme();

  const categoryLinks = [
    "DSA",
    "Practice Problems",
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "Data Science",
    "Machine Learning",
    "Courses",
    "Linux",
    "DevOps",
  ];

  const focusTags = ["DSA Online", "DS, ML & AI", "LLD & HLD"];

  return (
    <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
      <Header />

      <div className="category-strip" role="navigation" aria-label="Topics">
        <div className="category-strip-inner">
          {categoryLinks.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </div>
      </div>

      <section className="hero">
        <h1>Hello, What Do You Want To Learn?</h1>
        <div className="hero-search-wrap">
          <AnimatedPlaceholderInput className="hero-search" />
        </div>

        <div className="chip-row" aria-label="Focus filters">
          {focusTags.map((tag, index) => (
            <button
              key={tag}
              type="button"
              className={index === 0 ? "chip chip-active" : "chip"}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="mentor-card" aria-label="Learning roadmaps">
        <div className="mentor-card-left">
          <h2>
            Need help with
            <br />
            <span>Learning Roadmaps?</span>
          </h2>
          <p>
            Connect with trusted experts, anytime. Get real answers,
            real guidance, in real time.
          </p>
          <button type="button">Explore Now</button>
        </div>

        <div className="mentor-card-right" aria-hidden="true">
          <div className="chat-bubble bubble-a">
            Hi Everyone, hope you all are doing great. Here is a thought for the day!
          </div>
          <div className="chat-bubble bubble-b">
            Web3 is trending because it&apos;s changing the internet as we know it.
          </div>
          <div className="chat-bubble bubble-c">On-campus Interview Experience for SDE</div>

          <div className="avatar avatar-main">RK</div>
          <div className="avatar avatar-mid">AN</div>
          <div className="avatar avatar-low">SJ</div>
        </div>
      </section>
    </main>
  );
}
