import urlBuilder from "@sanity/image-url";
import { getImageDimensions } from "@sanity/asset-utils";
import Image from "next/image";
import { client } from "./lib/client";

// Barebones lazy-loaded image component
const SampleImageComponent = ({ value, isInline }) => {
  const builder = urlBuilder(client);
  console.log(value.caption);
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
  types: {
    image: SampleImageComponent,
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
  block: {
    // Ex. 1: customizing common block types
    h1: ({ children }) => <h1 className="text-2xl">{children}</h1>,
    normal: ({ children }) => (
      <div className=" mb-4 text-lg" style={{ lineHeight: 1.75 }}>
        {children}
      </div>
    ),
  },
};
