import Link from "next/link";

import { Container } from "@/components/Container";

function NavLink({ href, children }) {
  return (
    <Link href={href} className="transition hover:text-slate-600">
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="">
      <Container.Outer>
        <div className="pb-4">
          <Container.Inner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex gap-6 text-sm font-medium ">
                <NavLink href="/thoughts">Resume</NavLink>
                <NavLink href="https://www.linkedin.com/in/nikhilgoel10/">
                  LinkedIn
                </NavLink>
                <NavLink href="https://github.com/nickel-dime">Github</NavLink>
              </div>
              <p className="text-sm ">Made with ❤️ by Nikhil</p>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  );
}
