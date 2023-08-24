import Image from "next/image";
import { ExternalLink } from "./ExternalLink";

export function PostHeader({ headline, description, slug, github }) {
  return (
    <div className="flex flex-col gap-4">
      <img
        src={`/${slug.current}/hires.gif`}
        width={0}
        height={0}
        alt={headline}
        loading={"eager"}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        className="rounded-md"
      ></img>
      <div className=" text-5xl font-semibold">{headline}</div>
      <div className=" text-lg text-gray-600">
        <div>{description}</div>
        {github && (
          <div className="text-base text-black">
            <ExternalLink href={github}>
              Check out the Github here!
            </ExternalLink>
          </div>
        )}
      </div>
    </div>
  );
}
