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
import { getCurrentUser } from "../get-currect-user";
import { GraphQLError } from "graphql/index";
import { getFriends } from "../get-friends";
import { addFriend } from "../add-friend";

const checkUserSession = (context) => {
  if (!context.user) {
    throw new GraphQLError("Unauthorized");
  }
};

const wrapWithCheckUserSession = (fns) =>
  Object.keys(fns).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (_, args, ctx) => {
        checkUserSession(ctx);
        return fns[key](_, args, ctx);
      },
    }),
    {},
  );

const Query = wrapWithCheckUserSession({
  groups: getGroups,
  group: getGroup,
  me: getCurrentUser,
  friends: getFriends,
});

const Mutation = wrapWithCheckUserSession({
  createGroup,
  updateGroup,
  deleteGroup,
  createExpense,
  updateExpense,
  deleteExpense,
  createPayment,
  updatePayment,
  deletePayment,
  addFriend,
});

export const resolvers: IResolvers<{}> = {
  Query,
  Mutation,
};
