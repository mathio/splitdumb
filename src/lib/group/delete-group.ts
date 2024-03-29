import prisma from "../prisma";

import { userIsMemberOfGroup } from "./user-is-member-of-group";

export const deleteGroup = async (_, { id }: { id: string }, { user }) => {
  await userIsMemberOfGroup(user.id, id);

  try {
    await prisma.group.delete({
      where: { id: Number(id) },
    });
  } catch (e) {}
  return { id };
};
