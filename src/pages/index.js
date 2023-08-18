import Head from "next/head";
import { Container } from "@/components/Container";
var ReactRotatingText = require("react-rotating-text");
import BubbleElement from "./test";
import Updates from "@/components/Updates";
import { getUpdates } from "../../sanity/queries/update";
import { ExternalLink } from "@/components/ExternalLink";

export async function getStaticProps(context) {
  const updates = await getUpdates();

  updates.sort(function (a, b) {
    const date1 = a.date;
    const date2 = b.date;

    var aa = date1.split("/").reverse().join(),
      bb = date2.split("/").reverse().join();
    return aa > bb ? -1 : aa < bb ? 1 : 0;
  });

  const updatesSliced = updates.slice(0, 5);

  return { props: { updatesSliced } };
}

export const data = [
  <button className="flex flex-col aspect-square bg-[#4A154B] h-36 hover:bg-opacity-70 items-center justify-center p-8 rounded-full">
    <img src="dnotes.png" className="h-[30px]"></img>
    <div className="text-white text-md text-center font-black ">dNotes</div>
    <div className="text-white text-[10px] text-center font-black opacity-50">
      Hackathon
    </div>
  </button>,
  <button className="flex flex-col aspect-square bg-[#f3592a] h-36 hover:bg-opacity-80 items-center justify-center p-8 rounded-full">
    <img src="fireplace/fireplace.svg" className="h-[50px]"></img>
    <div className="text-white text-md mt-2 text-center font-black ">
      Fireplace
    </div>
    <div className="text-white text-[10px] text-center font-black opacity-50">
      Co-Founder
    </div>
  </button>,
  <button className="flex flex-col aspect-square bg-white h-36 hover:bg-opacity-80 items-center justify-center p-8 rounded-full">
    <img src="scout/scoutjustlogo.png" className="h-[50px]"></img>
    <div className="text-black text-md mt-2 text-center font-black ">Scout</div>
    <div className="text-black text-[10px] text-center font-black opacity-50">
      Project Lead
    </div>
  </button>,
  <button className="flex flex-col aspect-square bg-[#0C6B58] hover:bg-opacity-80 h-36 items-center justify-center p-8 rounded-full">
    <img
      src="connect-grid/connectgrid.ico"
      className="h-[50px] bg-black p-1 rounded-md"
    ></img>
    <div className="text-white text-[12px] mt-2 text-center font-black ">
      Connect Grid
    </div>
    <div className="text-white text-[10px] text-center font-black opacity-50">
      Sports Trivia
    </div>
  </button>,
  <button className="flex flex-col aspect-square bg-[#01b97d] h-36 hover:bg-opacity-80 items-center justify-center p-8 rounded-full">
    <img src="cactivate/cactivate.svg" className="h-[50px] rounded-full"></img>
    <div className="text-white text-md mt-2 text-center font-black ">
      Cactivate
    </div>
    <div className="text-white text-[10px] text-center font-black opacity-50">
      Software Dev
    </div>
  </button>,
  // <button className="flex flex-col aspect-square bg-[#01b97d] h-36 hover:bg-opacity-80 items-center justify-center p-8 rounded-full">
  //   <img src="cactivate.svg" className="h-[50px] rounded-full"></img>
  //   <div className="text-white text-md mt-2 text-center font-black ">
  //     Personal Website
  //   </div>
  // </button>,
];

export default function Home({ updatesSliced }) {
  const options = {
    size: 160,
    minSize: 20,
    gutter: 2,
    provideProps: true,
    numCols: 4,
    fringeWidth: 140,
    yRadius: 80,
    xRadius: 80,
    cornerRadius: 50,
    showGuides: false,
    compact: true,
    gravitation: 8,
  };

  // const data = [];

  const children = data
    .concat(data)
    .concat(data)
    .concat(data)
    .map((data_prop, i) => {
      return <Child data={data_prop} className="child" key={i}></Child>;
    });

  return (
    <>
      <Head>
        <title>Nikhil Goel</title>
        <meta name="description" content="Personal website for Nikhil Goel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ndimelogo.png" />
      </Head>
      <Container>
        <div className=" content-center fadeInLeft-animation">
          <div className="sm:max-w-[800px] max-w-[550px] mt-10">
            <div className="md:mb-10 mb-8">
              <div className="text-3xl md:text-[55px] sm:text-4xl max-w-2xl">
                <ReactRotatingText
                  items={["Hello!", "Hallo!", "Hola!", "Ciao!"]}
                />
                My name is{" "}
                <b className=" text-slate-800 font-cursive tracking-wider">
                  Nikhil
                </b>
              </div>
            </div>
            <div className="break-words">
              <div className="mb-3 max-w-xl leading-relaxed">
                I'm a software engineer{" "}
                <ExternalLink
                  href={"https://www.northeastern.edu"}
                  title={"@Northeastern"}
                ></ExternalLink>{" "}
                starting my fourth year. I'm passionate about building human
                centered interfaces. Feel free to email me at any time, I'm
                always happy to chat at a coffee shop! <br></br>
              </div>
              <div className="max-w-xl mt-6">
                Currently Co-Founder{" "}
                <ExternalLink
                  href={"https://www.makefireplace.com"}
                  title={"@Fireplace"}
                ></ExternalLink>
                . Previously Developer{" "}
                <ExternalLink
                  href={"https://www.cactivate.com/"}
                  title={"@Cactivate"}
                ></ExternalLink>
                , Project Lead{" "}
                <ExternalLink
                  href={"https://scout.camd.northeastern.edu/"}
                  title={"@Scout"}
                ></ExternalLink>
                , Intern{" "}
                <ExternalLink
                  href={"https://www.gotbot.co.za/"}
                  title={"@GotBot"}
                ></ExternalLink>
                ,{" &"} Intern{" "}
                <ExternalLink
                  href={"https://ceibal.edu.uy/en/"}
                  title={"@Plan Ceibal"}
                ></ExternalLink>
                .
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-5 pb-4 sm:pb-0">
              <div className=" basis-1/2">
                <div className="">
                  <a
                    href="/projects"
                    className="mt-10 w-fit font-semibold text-xl flex align-middle items-center group"
                  >
                    Projects
                    <div className="ml-1 align-middle transition-all ease-in-out duration-100 group-hover:ml-2 font-cursive justify-center items-center h-full">
                      &#x2192;
                    </div>
                  </a>
                </div>

                <div className="mt-5 mb-3 bg-slate-700 rounded-lg backdrop-blur-lg">
                  <BubbleElement options={options} className="myBubbleUI">
                    {children}
                  </BubbleElement>
                </div>
              </div>
              <div className="basis-1/2">
                <div className="">
                  <a
                    href="/updates"
                    className="sm:mt-10 w-fit font-semibold text-xl flex align-middle items-center group"
                  >
                    Updates
                    <div className="ml-1 align-middle transition-all ease-in-out duration-100 group-hover:ml-2 font-cursive justify-center items-center h-full">
                      &#x2192;
                    </div>
                  </a>
                </div>
                <div className="mt-5 mb-3 bg-white text-black rounded-lg">
                  <div className="h-[300px] px-4 overflow-auto">
                    <Updates updatesSliced={updatesSliced}></Updates>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

function Child({ data }) {
  return (
    <div className="childComponent" onClick={() => console.log(data)}>
      {data}
    </div>
  );
}
