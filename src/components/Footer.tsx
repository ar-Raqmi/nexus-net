import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-paper/85">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <div>
            <p className="font-semibold text-ink">Nexus Net · ASEAN Quest</p>
            <p>
              Built for Hacktoberfest Hack Day KL 2026 · Startup ASEAN · all
              data is fictional demo data
            </p>
          </div>
        </div>
        <p className="font-semibold">Powered by Gemma 4</p>
      </div>
    </footer>
  );
}
