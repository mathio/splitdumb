import prisma from "../prisma";
import { GraphQLError } from "graphql";

export const getCurrentUser = async (_, _args, context) => {
  return prisma.user.findUnique({ where: { id: context.user.id } });
};
