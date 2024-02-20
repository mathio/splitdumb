import prisma from "../prisma";

export const getGroups = async (_, args, { user }) => {
  return prisma.group.findMany({
    where: {
      OR: [
        {
          members: {
            some: { id: user.id },
          },
        },
        { user: { id: user.id } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
};
