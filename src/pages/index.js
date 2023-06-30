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
        <div className="indexPage content-center">
          <div className="max-w-[550px] m-10 pt-40 pb-40">
            <section>
              <div className="flex text-7xl mb-10">Hello! I am Nikhil!</div>
            </section>
            <section className="">
              <div className="mb-3">
                I am a software engineer @Northeastern staring my fourth year.
                I'm passionate about building human centered software. <br></br>
              </div>
              <div className="">
                Previously @Cactivate, @Scout, @GotBot, &nbsp;
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
