import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import lettucesrikar from "@/images/lettucesrikar.png";
import thisisamerica from "@/images/thisisamerica.png";
import bua from "@/images/bua.png";
import { Container } from "@/components/Container";
import { Update } from "@/components/Update";
import { getUpdates } from "../../sanity/queries/update";

import { MdWork, MdRssFeed, MdPublic, MdCode, MdBolt } from "react-icons/md";

export async function getStaticProps(context) {
  const updates = await getUpdates();

  updates.sort(function (a, b) {
    const date1 = a.date;
    const date2 = b.date;

    var aa = date1.split("/").reverse().join(),
      bb = date2.split("/").reverse().join();
    return aa > bb ? -1 : aa < bb ? 1 : 0;
  });

  return { props: { updates } };
}

export default function UpdatesPage({ updates }) {
  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ndimelogo.png" />
      </Head>
      <Container>
        <div className="flex flex-col gap-4 fadeInRight-animation">
          <div className="mt-10 text-4xl font-bold">Updates</div>
          <div className="">
            A collection of updates on my life, from blog posts to projects to
            random ideas!
          </div>
          <div className="bg-[#A1CCD1] sm:bg-inherit sm:rounded-none rounded-md px-4 py-2 sm:p-0 mt-3 mb-10 flex flex-col sm:divide-none divide-y divide-opacity-60  divide-dotted divide-black">
            {updates.map((update) => (
              <Update
                key={update._id}
                text={update.update}
                date={update.date}
                category={update.category}
              ></Update>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
