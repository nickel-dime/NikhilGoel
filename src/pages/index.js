import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import lettucesrikar from "@/images/lettucesrikar.png";
import thisisamerica from "@/images/thisisamerica.png";

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
    bottomheader: "CHILDISH GAMBINO",
    bottomText: "10.10.2023",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [gambinoEnabled, setGamibnoEnabled] = useState(false);

  console.log(gambinoEnabled);

  return (
    <>
      <Head>
        <title>Nikhil</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="relative flex container mx-auto h-screen place-items-center justify-center">
          <div className="flex flex-col p-6 justify-evenly items-center font-display h-[80%]">
            <div className="basis-1/12 mb-8 text-2xl">
              THIS IS LETTUCE SRIKAR
            </div>
            <Image
              src={lettucesrikar}
              alt="This is America cover"
              className="aspect-auto w-72"
            ></Image>
            <div className="basis-1/4 flex flex-col items-center justify-end">
              <div className="text-lg">WANTED BY FBI</div>
              <div className="">1-800-CALLFBI</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
