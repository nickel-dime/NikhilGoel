import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

import { Header } from "@/components/Header";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";
import { Footer } from "@/components/Footer";
import { createContext, useEffect, useRef } from "react";

export default function App({ Component, pageProps }) {
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const loader = document.getElementById("globalLoader");
  //     if (loader) loader.remove();
  //   }
  // }, []);

  useEffect(() => {
    const arraySrcs = [
      "connect-grid/hires.gif",
      "dnotes/hires.gif",
      "cactivate/hires.gif",
    ];

    arraySrcs.map((e) => <img src={e} style={{ display: "none" }} />);
  }, []);

  const router = useRouter();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  if (router.pathname.includes("studio")) {
    return (
      <>
        <div className="">
          {/* <div className="fixed inset-0 flex justify-center sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="w-full" />
          </div>
        </div> */}
          <div className="module-inside flex flex-col font-fira min-h-screen text-slate-900 bg-[#fcedc7]">
            <main className="grow">
              <Component {...pageProps} />
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <div id="globalLoader">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
          alt=""
        />
      </div> */}
      <div className="">
        {/* <div className="fixed inset-0 flex justify-center sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="w-full" /> fcedc7
          </div>
        </div> */}
        <div className="module-inside flex flex-col font-whitney min-h-screen text-slate-900 bg-[#fbf1d6]">
          <Header></Header>
          <main className="grow">
            <Component {...pageProps} />
          </main>
          <Footer></Footer>
        </div>
      </div>
      <Analytics />
    </>
  );
}
