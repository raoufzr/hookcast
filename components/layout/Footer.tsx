export function Footer() {
  return (
    <footer className="border-t border-ink/10 py-10 text-sm text-ink-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <span>© {new Date().getFullYear()} Hookcast.</span>
        <span>Analysis powered by Claude. Not affiliated with YouTube, TikTok, or Instagram.</span>
      </div>
    </footer>
  );
}
