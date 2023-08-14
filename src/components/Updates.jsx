// const activityItems = [
//   {
//     title: {
//       name: "Created Connect Grid",
//       icon: "connectgrid.ico",
//     },
//     description:
//       "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
//     date: "Jul 23",
//     dateTime: "2023-01-23T11:00",
//   },
//   {
//     title: {
//       name: "Created Connect Grid",
//       icon: "connectgrid.ico",
//     },
//     description:
//       "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
//     date: "Jul 23",
//     dateTime: "2023-01-23T11:00",
//   },
//   {
//     title: {
//       name: "Created Connect Grid",
//       icon: "connectgrid.ico",
//     },
//     description:
//       "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
//     date: "Jul 23",
//     dateTime: "2023-01-23T11:00",
//   },
//   {
//     title: {
//       name: "Created Connect Grid",
//       icon: "connectgrid.ico",
//     },
//     description:
//       "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
//     date: "Jul 23",
//     dateTime: "2023-01-23T11:00",
//   },
//   {
//     title: {
//       name: "Created Connect Grid",
//       icon: "connectgrid.ico",
//     },
//     description:
//       "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
//     date: "Jul 23",
//     dateTime: "2023-01-23T11:00",
//   },
// ];

// export default function Updates() {
//   return (
//     <ul role="list" className="divide-y divide-gray-100">
//       {activityItems.map((item) => (
//         <li key={item.commit} className="py-2 ">
//           <button className="hover:bg-slate-100 text-left w-full rounded-md p-2">
//             <div className="flex items-center gap-x-3">
//               <img src={item.title.icon} alt="" className="h-6 w-6 flex-none" />
//               <h3 className="flex-auto truncate text-md font-semibold leading-6 ">
//                 {item.title.name}
//               </h3>
//               <time dateTime={item.dateTime} className="flex-none text-sm ">
//                 {item.date}
//               </time>
//             </div>
//             <p className="mt-3 break-normal text-sm ">{item.description}</p>
//           </button>
//         </li>
//       ))}
//     </ul>
//   );
// }

import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import { MdOutlineWorkOutline } from "react-icons/md";

const timeline = [
  {
    id: 1,
    content: "Created Connect Grid Game",
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: MdOutlineWorkOutline,
    iconBackground: "bg-white",
  },
  {
    id: 2,
    content: "Created Connect Grid Game",
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: MdOutlineWorkOutline,
    iconBackground: "bg-white",
  },
  {
    id: 3,
    content: "Created Connect Grid Game",
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: MdOutlineWorkOutline,
    iconBackground: "bg-white",
  },
  {
    id: 4,
    content: "Created Connect Grid Game",
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: MdOutlineWorkOutline,
    iconBackground: "bg-white",
  },
  {
    id: 5,
    content: "Created Connect Grid Game",
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: MdOutlineWorkOutline,
    iconBackground: "bg-white",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Updates() {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8 mt-2">
        {timeline.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative ">
              {eventIdx !== timeline.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-4/6 w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative  flex space-x-3  ">
                <span
                  className={classNames(
                    "h-8 w-8 bg-white py-4 rounded-full flex items-center justify-center"
                  )}
                >
                  <event.icon className="h-5 w-5 " aria-hidden="true" />
                </span>
                <a
                  href={event.href}
                  className="flex flex-col min-w-0 pt-1 flex-1 hover:opacity-60 rounded-md p-1"
                >
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-900">{event.content}</div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={event.datetime}>{event.date}</time>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{event.description}</p>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
