import LogoContent from "./LogoContent";
import { ModeToggle } from "./ModeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-black w-screen h-16">
      <a href="/" className="flex items-center gap-4">
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="1508.204676pt"
          height="836.077412pt"
          viewBox="0 0 1508.204676 836.077412"
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-[50px] text-black dark:text-white"
        >
          <LogoContent />
        </svg>
        <div className="text-xl font-semibold font-serif">RhinoMeet</div>
      </a>
      <ModeToggle />
    </header>
  );
}
