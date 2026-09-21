import { MdOutlineEvent } from "react-icons/md";

const occasion = {
  name: "occasion",
  title: "Occasions",
  type: "document",
  icon: MdOutlineEvent,
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "A situation, not a garment type. e.g. Office, Date, Long run",
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
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls the order of the filter chips. Lower shows first.",
    },
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
};

export default occasion;
