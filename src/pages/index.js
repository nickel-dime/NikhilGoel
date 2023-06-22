import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import lettucesrikar from "@/images/lettucesrikar.png";
import thisisamerica from "@/images/thisisamerica.png";
// import bua from "@/images/bua.PNG";

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
  const [randomNumber, setRandomNumber] = useState(0);

  useEffect(() => {
    generateRandomNumber();
  }, []);

  const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * data.length);
    setRandomNumber(randomNumber);
  };

  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="relative flex container mx-auto h-screen place-items-center justify-center">
          <div className="flex flex-col p-6 justify-evenly items-center font-display h-[80%]">
            <Image
              src={thisisamerica}
              height={300}
              width={500}
              alt="This is America cover"
              className="aspect-[3/4]"
            ></Image>
            <div>your clue resides with them</div>
          </div>
        </div>
      </main>
    </>
  );
}
