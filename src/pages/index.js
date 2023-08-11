import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import lettucesrikar from "@/images/lettucesrikar.png";
import thisisamerica from "@/images/thisisamerica.png";
import bua from "@/images/bua.png";
import { Container } from "@/components/Container";

const data = [
  {
    header: "THIS IS LETTUCE SRIKAR",
    image: lettucesrikar,
    bottomHeader: "WANTED BY FBI",
    bottomText: "1-800-CALLFBI",
  },
  {
    header: "THIS IS AMERICA",
    image: thisisamerica,
    bottomHeader: "CHILDISH GAMBINO",
    bottomText: "10.10.2023",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div className=" content-center">
          <div className="md:max-w-[800px] max-w-[550px] my-10 pt-20 pb-40">
            <section className="flex h-16 md:h-20 md:mb-10">
              <div className="text-4xl md:text-6xl sm:text-4xl">Hello</div>
              <div className="text-4xl md:text-6xl sm:text-4xl">
                {" "}
                ,&nbsp;I am a
              </div>
              <div className="text-4xl md:text-6xl font-bold sm:text-4xl shrink overflow-hidden">
                <span className="spin"></span>
                <span className="spin">student</span>
                <span className="spin">traveler</span>
                <span className="spin">developer</span>
                <span className="spin">designer</span>
              </div>
            </section>
            <section className="break-words">
              <div className="mb-3 max-w-xl leading-relaxed">
                I'm a software engineer{" "}
                <span>
                  <a
                    href="https://northeastern.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @Northeastern
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>{" "}
                staring my fourth year. I'm passionate about building human
                centered software. I love to combine my passions for sports and
                music with well built and designed software. Feel free to email
                me at any time, I'm always happy to get a coffee! <br></br>
              </div>
              <div className="max-w-xl leading-relaxed mt-10">
                Currently Co-Founder{" "}
                <span>
                  <a
                    href="https://palantir.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @Fireplace
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>
                . Previously Developer{" "}
                <span>
                  <a
                    href="https://palantir.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @Cactivate
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>
                , Project Lead{" "}
                <span>
                  <a
                    href="https://palantir.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @Scout
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>
                , Intern{" "}
                <span>
                  <a
                    href="https://palantir.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @GotBot
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>
                ,{" &"} Intern{" "}
                <span>
                  <a
                    href="https://palantir.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline transition-all text-primaryText"
                  >
                    @Plan Ceibal
                  </a>
                  <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
                </span>
                .
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
