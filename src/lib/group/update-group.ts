import prisma from "../prisma";

import { userIsMemberOfGroup } from "./user-is-member-of-group";

export const updateGroup = async (
  _,
  { id, title }: { id: string; title: string },
  { user },
) => {
  await userIsMemberOfGroup(user.id, id);

  return prisma.group.update({
    where: { id: Number(id) },
    data: {
      title,
    },
  });
};
