import { IResolvers } from "@graphql-tools/utils/typings/Interfaces";
import { getGroup } from "../get-group";
import { getGroups } from "../get-groups";
import { createGroup } from "../create-group";
import { updateGroup } from "../update-group";
import { createPayment } from "../create-payment";
import { deletePayment } from "../delete-payment";
import { updatePayment } from "../update-payment";

export const resolvers: IResolvers<{}> = {
  Query: {
    groups: getGroups,
    group: getGroup,
  },
  Mutation: {
    createGroup,
    updateGroup,
    createPayment,
    updatePayment,
    deletePayment,
  },
};
