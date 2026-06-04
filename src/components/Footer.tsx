import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card mt-12">
    <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>© {new Date().getFullYear()} Bradford College — The Big 4: Level Up</span>
      <nav className="flex items-center gap-4">
        <Link to="/privacy" className="hover:text-foreground underline-offset-4 hover:underline font-medium">
          Privacy Notice
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
