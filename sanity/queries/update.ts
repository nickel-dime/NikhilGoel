import { groq } from "next-sanity";
import { client } from "../lib/client";

export async function getUpdates() {
  const updates = await client.fetch(groq`*[_type == "update"]`);
  return updates;
}
