import Image from "next/image";

export function PostHeader({ headline, description, slug }) {
  return (
    <div className="flex flex-col gap-4">
      <Image
        src={`/${slug.current}/hires`}
        width={0}
        height={0}
        alt={headline}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        className="rounded-md"
      ></Image>
      <div className=" text-5xl font-semibold">{headline}</div>
      <div className=" text-lg text-gray-600">{description}</div>
    </div>
  );
}
