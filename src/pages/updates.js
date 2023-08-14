import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import lettucesrikar from "@/images/lettucesrikar.png";
import thisisamerica from "@/images/thisisamerica.png";
import bua from "@/images/bua.png";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Update } from "@/components/Update";

import { MdWork, MdRssFeed, MdPublic, MdCode, MdBolt } from "react-icons/md";

export default function UpdatesPage() {
  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div className="flex flex-col gap-4 fadeInRight-animation">
          <div className="mt-10 text-4xl font-bold">Updates</div>
          <div className="">
            A collection of updates on my life, from blog posts to projects to
            random ideas!
          </div>
          <div className="mt-3 mb-10 flex flex-col">
            <Update
              text={
                "Started at Northeastern University as a Computer Science student."
              }
              icon={<MdWork className=" fill-lime-800"></MdWork>}
            ></Update>
            <Update
              text={
                "Developed the website Connect Grid Game, gaining 10K users in a month."
              }
              icon={<MdRssFeed className=" fill-sky-500"></MdRssFeed>}
            ></Update>
            <Update
              text={
                "Started working at a startup in Boston called Cactivate with my friend Srikar."
              }
              icon={<MdPublic className=" fill-cyan-800"></MdPublic>}
            ></Update>
            <Update
              text={"Went on a study abroad trip to Spain! Que bonita!"}
              icon={<MdCode className=" fill-rose-800"></MdCode>}
            ></Update>
            <Update
              text={"Started making this beautiful website :)"}
              icon={<MdBolt className=" fill-yellow-600"></MdBolt>}
            ></Update>
          </div>
        </div>
      </Container>
    </>
  );
}
