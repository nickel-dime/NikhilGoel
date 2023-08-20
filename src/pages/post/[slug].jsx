// post.tsx
import { Container } from "@/components/Container";
import Head from "next/head";
import { useRouter } from "next/router";
import { client } from "../../../sanity/lib/client";
import { PortableText } from "@portabletext/react";
import { PostHeader } from "@/components/PostHeader";
import { components } from "../../../sanity/serializer";

const Post = ({ project }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ndimelogo.png" />
      </Head>
      <Container>
        <article className="">
          <div className=" flex mt-10">
            <PostHeader
              headline={project.headline}
              description={project.short_description}
              slug={project.slug}
            ></PostHeader>
          </div>
          <div
            className="float-right mt-10 ml-5 mb-4 max-w-[200px] rounded-md p-5 "
            style={{ backgroundColor: project.pastel_color }}
          >
            <Descriptor
              name="Timeline"
              value={project.specificTimeline}
            ></Descriptor>
            <Descriptor name="Tools" value={project.tools}></Descriptor>
            <Descriptor name="Role" value={project.role}></Descriptor>
          </div>
          <div className="mt-10 gap-6 mb-8 clear-left">
            <div className="">
              <PortableText value={project.content} components={components} />
            </div>
          </div>
        </article>
      </Container>
    </>
  );
};

function Descriptor({ name, value }) {
  return (
    <div className="flex flex-col">
      <div className=" font-bold">{name}</div>
      <div className="">{value}</div>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == "project" && defined(slug.current)][].slug.current`
  );

  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  // It's important to default the slug so that it doesn't return "undefined"
  const { slug = "" } = context.params;
  const project = await client.fetch(
    `
    *[_type == "project" && slug.current == $slug][0]
  `,
    { slug }
  );

  return {
    props: {
      project,
    },
  };
}

export default Post;
