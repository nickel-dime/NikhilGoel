import { type SchemaTypeDefinition } from "sanity";
import project from "./schemas/project";
import update from "./schemas/update";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, update],
};
