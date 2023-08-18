import {
  MdBolt,
  MdCode,
  MdOutlineWorkOutline,
  MdPublic,
  MdRssFeed,
  MdWork,
} from "react-icons/md";

export const categoryToIcon = {
  project: <MdCode MdCode className=" fill-rose-800"></MdCode>,
  travel: <MdPublic className=" fill-cyan-800"></MdPublic>,
  work: <MdWork className=" fill-lime-800"></MdWork>,
  blog: <MdRssFeed className=" fill-sky-500"></MdRssFeed>,
  update: <MdBolt className=" fill-yellow-600"></MdBolt>,
};

export function Update({ text, category, date, url }) {
  // bg-gradient-to-r from-[#A1CCD1] to-[#35be63]
  return (
    <>
      <a
        href={url}
        className={`flex sm:items-center sm:space-x-4 justify-between ${
          url ? "sm:hover:bg-[#e3d5b3]" : ""
        } p-2 sm:rounded-md`}
      >
        <div className="sm:flex-none font-medium">
          <div className="flex align-middle justify-center sm:items-center">
            <div className="mt-1 sm:mt-0">{categoryToIcon[category]}</div>
            <div className="sm:mt-[0.125rem] ml-3 text-sm sm:text-base text-left ">
              {text}
            </div>
          </div>
          {/* <div className="text-slate-900 whitespace-pre-wrap flex-shrink  flex justify-center ml-3 max-w-sm text-md text-clip">
            {text}
          </div> */}
          {/* {text} */}
        </div>
        <div className="w-full border-t border-gray-800 border-dotted shrink mt-1 hidden sm:block"></div>
        <div className="flex-none font-mono text-quaternary text-xs sm:text-sm pl-1">
          {date}
        </div>
      </a>
    </>
  );
}
