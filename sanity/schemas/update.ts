import { defineField } from "sanity";
import { MdWork, MdRssFeed, MdPublic, MdCode, MdBolt } from "react-icons/md";

const update = {
  name: "update",
  title: "Updates",
  type: "document",
  icon: MdBolt,
  fields: [
    {
      name: "headline",
      title: "Headline",
      type: "string",
    },
    {
      name: "update",
      title: "Update",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Project", value: "project" },
          { title: "Travel", value: "travel" },
          { title: "Work", value: "work" },
          { title: "Update", value: "update" },
          { title: "Blog", value: "blog" },
        ],
      },
    },
    {
      name: "date",
      title: "Date",
      type: "string",
    },
    {
      name: "url",
      title: "url",
      type: "url",
    },
    {
      name: "content",
      title: "Conent",
      type: "array",
      of: [{ type: "block" }],
    },
  ],
};

export default update;
