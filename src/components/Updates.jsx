import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";

import { MdOutlineWorkOutline } from "react-icons/md";
import { getUpdates } from "../../sanity/queries/update";
import { categoryToIcon } from "./Update";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Updates({ updatesSliced }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8 mt-2">
        {updatesSliced.map((update, eventIdx) => (
          <li key={update._id}>
            <div className="relative ">
              {eventIdx !== updatesSliced.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-4/6 w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative  flex  ">
                <span
                  className={classNames(
                    "h-8 w-8 bg-white py-4 rounded-full flex items-center justify-center"
                  )}
                >
                  {categoryToIcon[update.category]}
                  {/* <event.icon className="h-5 w-5 " aria-hidden="true" /> */}
                </span>
                {update.url ? (
                  <Link
                    href={update.url}
                    className="flex flex-col min-w-0 pt-1 flex-1 group rounded-md p-1"
                  >
                    <div className="flex justify-between">
                      <div className="text-md group-hover:opacity-70 text-gray-900">
                        {update.headline}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-700">
                        {update.date}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{update.update}</p>
                  </Link>
                ) : (
                  <div className="flex flex-col min-w-0 pt-1 flex-1 group rounded-md p-1">
                    <div className="flex justify-between">
                      <div className="text-md text-gray-900 ">
                        {update.headline}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-700">
                        {update.date}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{update.update}</p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
