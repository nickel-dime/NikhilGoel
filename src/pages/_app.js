import "../styles/globals.css";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function App({ Component, pageProps }) {
  return (
    <>
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
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

      <div className="testStyle overflow-hidden ">
        <div className="module-inside h-screen flex flex-col justify-between ">
          <div className="">
            <Header></Header>
          </div>
          <main className="">
            <Component {...pageProps} />
          </main>
          <div className="">
            <Footer></Footer>
          </div>
        </div>
      </div>
    </>
  );
}
