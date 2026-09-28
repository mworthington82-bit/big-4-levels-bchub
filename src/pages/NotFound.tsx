import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import B4Brand from "@/components/B4Brand";
import { ThreadWorksFooter } from "@/components/threadworks";
import ropeFrayed from "@/assets/art/rope/rope-frayed.webp";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card/95 shadow-card">
        <div className="container mx-auto px-4 py-3">
          <B4Brand to="/" />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card animate-tw-rise">
          <img src={ropeFrayed} alt="" className="mx-auto mb-6 h-24 w-auto" />
          <h1 className="mb-2 text-3xl font-bold text-b4-strong">This thread has come loose</h1>
          <p className="mb-6 text-muted-foreground">
            We couldn't find that page. It may have moved, or the link may be out of date.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Back to The Big 4
          </Link>
        </div>
      </main>
      <ThreadWorksFooter />
    </div>
  );
};

export default NotFound;
