import { Container } from "@/components/Container";
import { Transition } from "@headlessui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getProjects } from "../../sanity/queries/project";
import Card from "@/components/Card";

export async function getServerSideProps(context) {
  const prevURL = context.req.headers.referer
    ? context.req.headers.referer
    : null;
  const projects = await getProjects();

  return { props: { prevURL, projects } };
}

export default function Projects({ prevURL = null, projects }) {
  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div
          className={`flex flex-col gap-4 ${
            prevURL == null
              ? ""
              : prevURL.includes("updates")
              ? "fadeInLeft-animation"
              : "fadeInRight-animation"
          }`}
        >
          <div className="mt-10 text-4xl font-bold">Projects</div>
          <div className="">
            A collection of projects I've designed, prototyped and developed.
          </div>
          <div className="mt-3 grid-cols-1 grid gap-8 mb-10">
            {projects.map((project) => (
              <Card key={project._id} project={project}></Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
