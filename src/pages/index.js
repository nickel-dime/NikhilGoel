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
        <div className="max-w-[550px] ">
          <section>
            <div className="flex mt-20 text-7xl">Hello! I am Nikhil!</div>
          </section>
          <section className="mt-5">
            <div className="">
              I am a software engineer @Northeastern staring my fourth year. I'm
              passionate about building human centered software. <br></br>
            </div>
            <div className="mt-3">
              Previously @Cactivate, @Scout, @GotBot, @Plan Ceibal
              <span>
                <a
                  href="https://palantir.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline transition-all text-primaryText"
                >
                  @Palantir
                </a>
                <span class="bottom-[-0.1em] relative ml-0.5">↗</span>
              </span>
            </div>
            <div className="relative">HI</div>
          </section>
        </div>
      </Container>
    </>
  );
}
