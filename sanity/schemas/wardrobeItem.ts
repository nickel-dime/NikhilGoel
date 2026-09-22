import { MdOutlineStyle } from "react-icons/md";

// Ordered by body position, which is how the wardrobe page groups the grid.
export const wardrobeCategories = [
  { title: "Tops", value: "tops" },
  { title: "Layers", value: "layers" },
  { title: "Bottoms", value: "bottoms" },
  { title: "Outerwear", value: "outerwear" },
  { title: "Footwear", value: "footwear" },
  { title: "Accessories", value: "accessories" },
];

// What the garment is, one level below category. Category answers "where on
// the body", type answers "what kind"; use (gym, office) lives in occasions.
export const wardrobeTypes = {
  tops: ["T-shirt", "Long-sleeve tee", "Polo", "Henley", "Tank", "Shirt", "Jersey"],
  layers: ["Sweater", "Hoodie", "Sweatshirt", "Quarter-zip", "Cardigan"],
  bottoms: ["Jeans", "Trousers", "Cargo pants", "Joggers", "Shorts", "Athletic shorts"],
  outerwear: ["Jacket", "Coat", "Vest", "Overshirt"],
  footwear: ["Sneakers", "Boots", "Loafers", "Sandals"],
  accessories: ["Hat", "Belt", "Bag", "Socks"],
};

export const wardrobeSeasons = [
  { title: "Warm weather", value: "warm" },
  { title: "Cold weather", value: "cold" },
  { title: "Year-round", value: "year-round" },
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
      name: "type",
      title: "Type",
      type: "string",
      description: "What kind of garment, within its category.",
      options: {
        list: Object.entries(wardrobeTypes).flatMap(([category, types]) =>
          types.map((type) => ({ title: `${type} (${category})`, value: type }))
        ),
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
      name: "season",
      title: "Season",
      type: "string",
      description: "When it gets worn. Short sleeves and shorts are warm; knits and long sleeves are cold.",
      options: {
        list: wardrobeSeasons,
      },
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
