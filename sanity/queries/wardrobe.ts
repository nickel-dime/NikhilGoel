import { groq } from "next-sanity";
import { client } from "../lib/client";

export async function getWardrobe() {
  const items = await client.fetch(groq`*[_type == "wardrobeItem" && defined(image)]{
    "id": _id,
    "slug": slug.current,
    name,
    brand,
    category,
    colorway,
    season,
    image,
    "occasions": occasions[]->{ "slug": slug.current, name },
    source
  }`);
  return items;
}

export async function getOccasions() {
  const occasions = await client.fetch(groq`*[_type == "occasion"]
    | order(coalesce(order, 999) asc, name asc){
      "slug": slug.current,
      name
    }`);
  return occasions;
}
