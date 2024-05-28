import { InternetIdentityButton } from "@bundly/ares-react";

export default function Header() {
  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <strong>ARES CONNECT</strong>
        </div>
        <div className="lg:flex lg:gap-x-12"></div>
        <div className="lg:flex lg:flex-1 lg:justify-end">
          <InternetIdentityButton />
        </div>
      </nav>
    </header>
  );
}
