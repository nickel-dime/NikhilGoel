import Link from "next/link";

import { Container } from "@/components/Container";

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="transition hover:text-teal-500 dark:hover:text-teal-400"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mb-10">
      <Container.Outer>
        <div className="pt-10">
          <Container.Inner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex gap-6 text-sm font-medium text-black">
                <NavLink href="/thoughts">Resume</NavLink>
                <NavLink href="/about">LinkedIn</NavLink>
                <NavLink href="/projects">Github</NavLink>
              </div>
              <p className="text-sm text-black">Made with ❤️ by Nikhil Goel</p>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  );
}
