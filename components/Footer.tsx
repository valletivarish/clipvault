export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-7 py-[14px] bg-s1 border-t border-white/[0.06] text-[11px] text-t3">
      <div>© 2026 ClipVault</div>
      <div className="flex gap-4">
        <a href="/privacy" className="hover:text-t2 transition-colors cursor-pointer">
          Privacy
        </a>
        <a href="/terms" className="hover:text-t2 transition-colors cursor-pointer">
          Terms
        </a>
        <a href="/about" className="hover:text-t2 transition-colors cursor-pointer">
          About
        </a>
        <a href="/contact" className="hover:text-t2 transition-colors cursor-pointer">
          Contact
        </a>
      </div>
    </footer>
  );
}
