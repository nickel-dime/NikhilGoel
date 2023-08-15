import { defineField } from "sanity";
import { MdWork, MdRssFeed, MdPublic, MdCode, MdBolt } from "react-icons/md";

const project = {
  name: "project",
  title: "Projects",
  type: "document",
  icon: MdCode,
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
      },
    },
    {
      name: "date_range",
      title: "Date Range",
      type: "string",
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "string",
    },
    {
      name: "short_description",
      title: "Short Description",
      type: "string",
    },
    {
      name: "normal_image",
      title: "Normal Image",
      type: "image",
      options: {
        hotspot: "true",
      },
      fields: [
        {
          name: "alt",
          title: "alt",
          type: "string",
        },
      ],
    },
    {
      name: "gif_image",
      title: "Gif Image",
      type: "string",
    },
    {
      name: "color",
      title: "Color",
      type: "string",
    },
    {
      name: "pastel_color",
      title: "Pastel Color",
      type: "string",
    },
    {
      name: "statistic",
      title: "Statistic",
      type: "object",
      fields: [
        { name: "number", title: "Number", type: "string" },
        { name: "description", title: "description", type: "string" },
      ],
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

export default project;
