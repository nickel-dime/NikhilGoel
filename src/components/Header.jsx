import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";

import { Container } from "@/components/Container";
import { Fragment, useEffect, useRef } from "react";

function NavItem({ href, children }) {
  let isActive = useRouter().pathname === href.split("?")[0];

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          "relative block px-3 py-2 transition font-semibold text-lg",
          isActive ? " text-black" : " text-gray-600 sm:hover:text-slate-600 "
        )}
      >
        {children}
        {isActive && <span className="absolute inset-x-1 -bottom-px h-px  " />}
      </Link>
    </li>
  );
}

function DesktopNavigation(props) {
  return (
    <nav {...props}>
      <ul className="flex ">
        <NavItem href={`/projects?ref=${useRouter().pathname.slice(1)}`}>
          Projects
        </NavItem>
        <NavItem href="/updates">Updates</NavItem>
        {/* <NavItem href="/about">About</NavItem> */}
      </ul>
    </nav>
  );
}

function clamp(number, a, b) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  return Math.min(Math.max(number, min), max);
}

export function Header() {
  return (
    <>
      <header className="relative z-50 flex flex-col">
        <div className="top-0 z-10 h-16 pt-4">
          <Container className=" w-full">
            <div className="relative flex justify-between content-between align-middle">
              <div className="flex flex-1 justify-left pointer-events-auto -mt-1 items-center align-middle text-4xl font-cursive font-black text-center">
                <Link href="/" className="p-1 cursor-pointer">
                  Nikhil Goel
                </Link>
              </div>
              <div className="flex flex-initial justify-end align-middle md:justify-center">
                {/* <MobileNavigation className="pointer-events-auto md:hidden" /> */}
                <DesktopNavigation className="pointer-events-auto block text-xs sm:text-sm md:text-base" />
              </div>
            </div>
          </Container>
        </div>
      </header>
    </>
  );
}
