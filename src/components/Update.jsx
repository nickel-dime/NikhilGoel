import { MdOutlineWorkOutline, MdRssFeed } from "react-icons/md";

export function Update({ text, icon }) {
  // bg-gradient-to-r from-[#A1CCD1] to-[#35be63]
  return (
    <>
      <button className="flex items-center space-x-4 hover:bg-[#e3d5b3] p-3 rounded-md">
        <div className="flex-none font-medium">
          <div className="flex align-middle justify-center items-center">
            <div className="">{icon}</div>
            <div className="mt-1 ml-3">{text}</div>
          </div>
          {/* <div className="text-slate-900 whitespace-pre-wrap flex-shrink  flex justify-center ml-3 max-w-sm text-md text-clip">
            {text}
          </div> */}
          {/* {text} */}
        </div>
        <div className="w-full border-t border-gray-800 border-dotted shrink mt-1"></div>
        <div className="flex-none font-mono text-quaternary">07/2020</div>
      </button>
    </>
  );
}
