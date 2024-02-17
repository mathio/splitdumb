import { IResolvers } from "@graphql-tools/utils/typings/Interfaces";
import { getGroup } from "../get-group";
import { getGroups } from "../get-groups";
import { createGroup } from "../create-group";
import { updateGroup } from "../update-group";
import { deleteGroup } from "../delete-group";
import { createExpense } from "../create-expense";
import { updateExpense } from "../update-expense";
import { deleteExpense } from "../delete-expense";
import { createPayment } from "../create-payment";
import { updatePayment } from "../update-payment";
import { deletePayment } from "../delete-payment";

export const resolvers: IResolvers<{}> = {
  Query: {
    groups: getGroups,
    group: getGroup,
  },
  Mutation: {
    createGroup,
    updateGroup,
    deleteGroup,
    createExpense,
    updateExpense,
    deleteExpense,
    createPayment,
    updatePayment,
    deletePayment,
  },
};
