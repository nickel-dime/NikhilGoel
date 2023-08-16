import { groq } from "next-sanity";
import { client } from "../lib/client";

export async function getProjects() {
  const projects = await client.fetch(
    groq`*[_type == "project"]|order(ordering asc)`
  );
  return projects;
}
