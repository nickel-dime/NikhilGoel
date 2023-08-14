import "../styles/globals.css";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  if (router.pathname == "/studio") {
    return (
      <>
        <svg className="hidden">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              stitchTiles="stitch"
            />
            <feColorMatrix
              in="colorNoise"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
            />
            <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
            <feBlend in="SourceGraphic" in2="monoNoise" mode="screen" />
          </filter>
        </svg>

        <div className="testStyle font-sans">
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
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            stitchTiles="stitch"
          />
          <feColorMatrix
            in="colorNoise"
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
          />
          <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
          <feBlend in="SourceGraphic" in2="monoNoise" mode="screen" />
        </filter>
      </svg>

      <div className="testStyle font-sans">
        {/* <div className="fixed inset-0 flex justify-center sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="w-full" />
          </div>
        </div> */}
        <div className="module-inside flex flex-col font-fira min-h-screen text-slate-900 bg-[#fcedc7]">
          <Header></Header>
          <main className="grow">
            <Component {...pageProps} />
          </main>
          <Footer></Footer>
        </div>
      </div>
    </>
  );
}
