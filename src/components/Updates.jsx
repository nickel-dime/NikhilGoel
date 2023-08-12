const activityItems = [
  {
    title: {
      name: "Created Connect Grid",
      icon: "connectgrid.ico",
    },
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    date: "Jul 23",
    dateTime: "2023-01-23T11:00",
  },
  {
    title: {
      name: "Created Connect Grid",
      icon: "connectgrid.ico",
    },
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    date: "Jul 23",
    dateTime: "2023-01-23T11:00",
  },
  {
    title: {
      name: "Created Connect Grid",
      icon: "connectgrid.ico",
    },
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    date: "Jul 23",
    dateTime: "2023-01-23T11:00",
  },
  {
    title: {
      name: "Created Connect Grid",
      icon: "connectgrid.ico",
    },
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    date: "Jul 23",
    dateTime: "2023-01-23T11:00",
  },
  {
    title: {
      name: "Created Connect Grid",
      icon: "connectgrid.ico",
    },
    description:
      "Launched a sports trivia site built in NextJS with 10K+ monthly users.",
    date: "Jul 23",
    dateTime: "2023-01-23T11:00",
  },
];

export default function Updates() {
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {activityItems.map((item) => (
        <li key={item.commit} className="py-2 ">
          <button className="hover:bg-slate-600 text-left w-full rounded-md p-2">
            <div className="flex items-center gap-x-3">
              <img src={item.title.icon} alt="" className="h-6 w-6 flex-none" />
              <h3 className="flex-auto truncate text-md font-semibold leading-6 ">
                {item.title.name}
              </h3>
              <time dateTime={item.dateTime} className="flex-none text-sm ">
                {item.date}
              </time>
            </div>
            <p className="mt-3 break-normal text-sm ">{item.description}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
