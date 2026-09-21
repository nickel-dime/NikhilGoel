import { type SchemaTypeDefinition } from "sanity";
import project from "./schemas/project";
import update from "./schemas/update";
import wardrobeItem from "./schemas/wardrobeItem";
import occasion from "./schemas/occasion";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, update, wardrobeItem, occasion],
};
