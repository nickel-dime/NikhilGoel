export function Card() {
  // bg-gradient-to-r from-[#A1CCD1] to-[#35be63]
  return (
    <>
      <button className="flex gap-3 text-left group bg-[#A1CCD1]  hover:opacity-95 backdrop-blur-md rounded-md  sm:h-[200px] overflow-hidden">
        <div className="flex flex-col justify-center h-full p-3 ml-1">
          <div className="text-slate-900 text-xs tracking-wider mb-1 hidden sm:block">
            2020-2022
          </div>
          <div className="text-slate-900 text-lg sm:text-2xl font-bold">
            Connect Grid Game
          </div>
          <div className=" text-gray-600 text-xs sm:text-sm">
            Created a sports trivia game using NextJS and hosted it on Vercel,
            acheiving 10K+ visitors.
          </div>
          <div className=" mt-4 hidden sm:block">
            <div className="text-slate-900 text-lg leading-tight font-bold">
              10K+
            </div>
            <div className="text-gray-600 tracking-wider leading-tight text-xs">
              SPORTS LOVERS
            </div>
          </div>
        </div>
        <div className="relative justify-start -top-1 left-1 sm:-top-7 sm:left-[37px]  bg-center ">
          <img
            className="group-hover:scale-105 scale-125 sm:scale-100 transition-all duration-200 ease-in-out"
            src="tester.png"
          ></img>
        </div>
      </button>
    </>
  );
}
