import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const quotes = [
  "Technology makes learning more engaging and practical. Digital skills help us collaborate, stay organised and build skills we'll actually use in the future.",
  "Using VR for body swaps was fun and engaging — I feel like I learnt a lot more than I would have going through a PowerPoint in lesson.",
  "Digital skills are essential for students because they prepare us for real-life learning, work, and independence.",
  "When teachers show us videos related to the topic, we understand better. They show us how to do things — not just tell us.",
  "It personalises learning, fosters collaboration and engagement, and frees up the tutor to facilitate deeper learning.",
  "Digital skills are important for everyone to access their learning and education — and for preparing for job roles.",
  "I felt as if I was in real life, not next to a computer. That's when learning really sticks.",
];

const StudentQuoteCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const transition = useCallback((next: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(next);
      setVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      transition((current + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [current, transition]);

  return (
    <div className="max-w-[640px] mx-auto mt-8 text-left">
      {/* Context label */}
      <p className="uppercase text-[#F5A623] font-semibold tracking-wide" style={{ fontSize: 12 }}>
        💬 How students see digital learning
      </p>
      <p className="text-white/50 mt-1 leading-snug" style={{ fontSize: 14 }}>
        We asked Bradford College students why digital innovation matters to them. Here's what they said — in their own words.
      </p>

      {/* Quote box */}
      <div
        className="relative mt-4 px-6 py-6 md:px-8 md:py-8 rounded-[20px]"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          minHeight: 140,
        }}
      >

        <p
          className="font-display italic text-white/[0.92] relative z-10 transition-all duration-[400ms]"
          style={{
            fontSize: "clamp(16px, 2.5vw, 21px)",
            lineHeight: 1.55,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          "{quotes[current]}"
        </p>
      </div>

      {/* Attribution row */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <span className="uppercase text-[#F5A623] font-semibold tracking-[0.1em]" style={{ fontSize: 12 }}>
          💬 Bradford College Student
        </span>

        <div className="flex items-center gap-3">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => transition(i)}
                aria-label={`Go to quote ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === current ? 10 : 7,
                  height: i === current ? 10 : 7,
                  background: i === current ? "#F5A623" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          <Link
            to="/voices"
            className="text-white/50 hover:text-white/80 transition-colors"
            style={{ fontSize: 12 }}
          >
            Read more student voices →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentQuoteCarousel;
