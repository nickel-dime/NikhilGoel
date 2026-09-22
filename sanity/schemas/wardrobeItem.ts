import { MdOutlineStyle } from "react-icons/md";

// Ordered by body position, which is how the wardrobe page groups the grid.
export const wardrobeCategories = [
  { title: "Tops", value: "tops" },
  { title: "Sweatshirts", value: "sweatshirts" },
  { title: "Jerseys", value: "jerseys" },
  { title: "Activewear", value: "activewear" },
  { title: "Bottoms", value: "bottoms" },
  { title: "Outerwear", value: "outerwear" },
  { title: "Footwear", value: "footwear" },
  { title: "Accessories", value: "accessories" },
];

const wardrobeItem = {
  name: "wardrobeItem",
  title: "Wardrobe",
  type: "document",
  icon: MdOutlineStyle,
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "Short description of the piece. e.g. Faded blue oxford",
    },
    {
      name: "brand",
      title: "Brand",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc: { brand?: string; name?: string }) =>
          [doc.brand, doc.name].filter(Boolean).join(" "),
      },
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: wardrobeCategories,
      },
    },
    {
      name: "image",
      title: "Cutout",
      type: "image",
      description:
        "Transparent PNG/WebP cutout of the garment, from the extraction pipeline.",
      options: {
        hotspot: true,
      },
    },
    {
      name: "colorway",
      title: "Colorway",
      type: "string",
    },
    {
      name: "occasions",
      title: "Occasions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "occasion" }] }],
    },
    {
      name: "source",
      title: "Where it's from",
      type: "object",
      fields: [
        {
          name: "retailer",
          title: "Retailer",
          type: "string",
          description: "Defaults to the brand if left empty.",
        },
        {
          name: "url",
          title: "URL",
          type: "url",
        },
        {
          name: "status",
          title: "Status",
          type: "string",
          options: {
            list: [
              { title: "Available", value: "available" },
              { title: "Sold out", value: "sold-out" },
              { title: "Secondhand", value: "secondhand" },
            ],
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "brand",
      media: "image",
    },
  },
  orderings: [
    {
      title: "Brand",
      name: "brand",
      by: [{ field: "brand", direction: "asc" }],
    },
    {
      title: "Category",
      name: "category",
      by: [
        { field: "category", direction: "asc" },
        { field: "brand", direction: "asc" },
      ],
    },
  ],
};

export default wardrobeItem;
