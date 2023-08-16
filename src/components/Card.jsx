import { Project } from "@/types/projects";
import { urlForImage } from "../../sanity/lib/image";

// type MyImageProps = { project: Project };

export default function Card({ project }) {
  // bg-gradient-to-r from-[#A1CCD1] to-[#35be63]
  return (
    <>
      <button
        style={{ backgroundColor: project.pastel_color }}
        className={`sm:flex gap-3 hidden text-left group  sm:hover:opacity-95 backdrop-blur-md rounded-md overflow-hidden`}
      >
        <div
          // style={{ maxWidth: 388.3 }}
          className="flex flex-col justify-center h-full p-3 ml-1 sm:max-w-[388.3px] max-w-[178px] gap-3"
        >
          <div className="text-slate-900 text-xs tracking-wider items-center hidden sm:flex">
            {project.date_range}
          </div>
          <div className="">
            <div className="text-slate-900 text-lg sm:text-2xl font-bold">
              {project.name}
            </div>
            <div className=" text-gray-600 text-xs sm:text-sm grow">
              {project.short_description}
            </div>
          </div>
          {project.statistic && (
            <div className=" mt-4 hidden sm:block">
              <div className="text-slate-900 text-lg leading-tight font-bold">
                {project.statistic.number}
              </div>
              <div className="text-gray-600 tracking-wider leading-tight text-xs">
                {project.statistic.description}
              </div>
            </div>
          )}
        </div>
        <div className="relative justify-start -top-1 left-1 sm:top-10  sm:left-[20px]  bg-center ">
          <img
            className="sm:group-hover:scale-105 -rotate-[6deg] scale-125 rounded-md sm:scale-100 transition-all duration-200 ease-in-out"
            src={project.gif_image}
          ></img>
        </div>
      </button>
      <div
        className="flex sm:hidden flex-col rounded-md"
        style={{ backgroundColor: project.pastel_color }}
      >
        <button
          className={`gap-3 text-left group  sm:hover:opacity-95 backdrop-blur-md rounded-md  overflow-hidden`}
        >
          <div
            // style={{ maxWidth: 388.3 }}
            className="flex flex-col justify-center h-full p-3 ml-1"
          >
            <div className="text-slate-900 text-xs tracking-wider mb-1">
              {project.date_range}
            </div>
            <div className="text-slate-900 text-lg sm:text-2xl font-bold">
              {project.name}
            </div>
            <div className=" text-gray-600 text-xs sm:text-sm">
              {project.short_description}
            </div>
            {project.statistic && (
              <div className=" mt-4 hidden sm:block">
                <div className="text-slate-900 text-lg leading-tight font-bold">
                  {project.statistic.number}
                </div>
                <div className="text-gray-600 tracking-wider leading-tight text-xs">
                  {project.statistic.description}
                </div>
              </div>
            )}
          </div>
        </button>
        <div className=" p-4 rounded-md">
          <img className="rounded-md" src={project.gif_image}></img>
        </div>
      </div>
    </>
  );
}
