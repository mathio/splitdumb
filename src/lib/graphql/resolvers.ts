import { IResolvers } from "@graphql-tools/utils/typings/Interfaces";
import { getGroup } from "../group/get-group";
import { getGroups } from "../group/get-groups";
import { createGroup } from "../group/create-group";
import { updateGroup } from "../group/update-group";
import { deleteGroup } from "../group/delete-group";
import { createExpense } from "../expense/create-expense";
import { updateExpense } from "../expense/update-expense";
import { deleteExpense } from "../expense/delete-expense";
import { createPayment } from "../payment/create-payment";
import { updatePayment } from "../payment/update-payment";
import { deletePayment } from "../payment/delete-payment";
import { getCurrentUserProfile } from "../user/get-currect-user-profile";
import { GraphQLError } from "graphql/index";
import { getFriends } from "../friend/get-friends";
import { addFriend } from "../friend/add-friend";
import { updateProfile } from "../user/update-profile";
import { linkEmail } from "../user/link-email";

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
  me: getCurrentUserProfile,
  friends: getFriends,
});

const Mutation = wrapWithCheckUserSession({
  updateProfile,
  linkEmail,
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
