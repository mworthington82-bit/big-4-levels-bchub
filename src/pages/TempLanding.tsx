import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import flairImage from "@/assets/self-assessment-flair.png";

const SELF_ASSESSMENT_URL =
  "https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools";

const TempLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Admin bypass: 5 clicks on hidden corner reveals password prompt to access full site
  const handleAdminBypass = () => {
    const pwd = window.prompt("Admin password");
    if (pwd === "1610") {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5A623] flex flex-col items-center justify-center px-4 py-8">
      <main className="w-full max-w-6xl mx-auto">
        <img
          src={flairImage}
          alt="Welcome to The Big 4 Self Assessment — instructions: click the link below, add your name and email, complete all questions honestly, and click Submit at the end."
          className="w-full h-auto rounded-2xl shadow-2xl"
        />

        <div className="mt-8 text-center">
          <p className="text-2xl md:text-3xl font-bold text-[#1C1C2E]">
            To start your Self-Assessment,{" "}
            <a
              href={SELF_ASSESSMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 underline underline-offset-4"
            >
              click here
            </a>
            .
          </p>
          <p className="text-base md:text-lg text-[#1C1C2E]/80 mt-3">
            Remember to click <strong>Submit</strong> at the end so your responses are saved.
          </p>
        </div>
      </main>

      {/* Hidden admin bypass to reach the full site */}
      <button
        onClick={handleAdminBypass}
        aria-label="Admin access"
        className="fixed bottom-2 right-2 w-8 h-8 opacity-0"
      />
    </div>
  );
};

export default TempLanding;
