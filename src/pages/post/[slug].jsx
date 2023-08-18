// post.tsx
import { Container } from "@/components/Container";
import Head from "next/head";
import { useRouter } from "next/router";
import { client } from "../../../sanity/lib/client";
import { PortableText } from "@portabletext/react";
import { PostHeader } from "@/components/PostHeader";

const Post = ({ project }) => {
  const router = useRouter();

  const components = {
    block: {
      // Ex. 1: customizing common block types
      h1: ({ children }) => <h1 className="text-2xl">{children}</h1>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-purple-500">{children}</blockquote>
      ),

      // Ex. 2: rendering custom styles
      customHeading: ({ children }) => (
        <h2 className="text-lg text-primary text-purple-700">{children}</h2>
      ),
    },
  };

  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ndimelogo.png" />
      </Head>
      <Container>
        <article>
          <PostHeader></PostHeader>
          <PortableText value={project.content} components={components} />
        </article>
      </Container>
    </>
  );
};

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

  console.log(project);

  return {
    props: {
      project,
    },
  };
}

export default Post;
