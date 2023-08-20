import urlBuilder from "@sanity/image-url";
import { getImageDimensions } from "@sanity/asset-utils";
import Image from "next/image";
import { client } from "./lib/client";
import { ExternalLink } from "@/components/ExternalLink";
import getYouTubeId from "get-youtube-id";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

// Barebones lazy-loaded image component
const SampleImageComponent = ({ value, isInline }) => {
  const builder = urlBuilder(client);
  const { width, height } = getImageDimensions(value);
  return (
    <div className="float-right " style={{ marginLeft: "25px" }}>
      <img
        src={builder
          .image(value)
          .width(isInline ? 100 : 800)
          .auto("format")
          .url()}
        alt={value.alt || " "}
        loading="lazy"
        className="rounded-md mt-5"
        style={{
          // Display alongside text if image appears inside a block text span
          display: isInline ? "inline-block" : "block",

          // Avoid jumping around with aspect-ratio CSS property
          aspectRatio: width / height,
        }}
      ></img>
      <div className=" text-gray-600 text-sm mt-2">{value.caption || ""}</div>
    </div>
  );
};

export const components = {
  list: {
    bullet: ({ children }) => (
      <ul
        className=" list-decimal ml-3"
        style={{
          listStyle: "disc",
        }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => <ol className=" list-disc">{children}</ol>,

    // Ex. 2: rendering custom lists
    checkmarks: ({ children }) => (
      <ol className="m-auto text-lg">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-lg py-2">{children}</li>,
  },
  types: {
    image: SampleImageComponent,
    youtube: ({ value }) => {
      const id = getYouTubeId(value.url);
      return (
        <div className="flex grow">
          <iframe
            src={value.url}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      );
    },
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
  block: {
    // Ex. 1: customizing common block types
    h1: ({ children }) => <div className="text-5xl">{children}</div>,
    h2: ({ children }) => (
      <div className="font-semibold tracking-tight text-3xl mt-1 mb-1">
        {children}
      </div>
    ),
    h3: ({ children }) => (
      <div className="font-semibold tracking-tight text-xl mb-1">
        {children}
      </div>
    ),
    normal: ({ children }) => (
      <div className=" mb-4 text-lg" style={{ lineHeight: 1.75 }}>
        {children}
      </div>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith("/")
        ? "noreferrer noopener"
        : undefined;
      return <ExternalLink href={value.href} title={children}></ExternalLink>;
    },
  },
};
