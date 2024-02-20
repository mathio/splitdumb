import prisma from "../prisma";
import { GraphQLError } from "graphql/index";

export const userIsMemberOfGroup = async (
  userId: number,
  groupId: string | number,
) => {
  if (
    1 !==
    (await prisma.group.count({
      where: {
        id: Number(groupId),
        members: { some: { id: userId } },
      },
    }))
  ) {
    throw new GraphQLError("Forbidden");
  }
};
