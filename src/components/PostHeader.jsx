export function PostHeader({ headline, description }) {
  return (
    <div className="flex flex-col gap-4">
      <div className=" text-6xl font-semibold">{headline}</div>
      <div className=" text-base text-gray-600">{description}</div>
    </div>
  );
}
