import Users from "../collections/users/collection";
import { addField, dropField } from "./meta/utils";

export const up = async ({db}: MigrationContext) => {
  await addField(db, Users, "daemonName");
  await addField(db, Users, "daemonSpecies");
}

export const down = async ({db}: MigrationContext) => {
  await dropField(db, Users, "daemonSpecies");
  await dropField(db, Users, "daemonName");
}
