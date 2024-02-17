import { IResolvers } from "@graphql-tools/utils/typings/Interfaces";
import { getGroup } from "../get-group";
import { getGroups } from "../get-groups";

export const resolvers: IResolvers<{}> = {
  Query: {
    groups: getGroups,
    group: getGroup,
  },
};
