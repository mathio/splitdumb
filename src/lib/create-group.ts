import prisma from "./prisma";

export const createGroup = (_, { title }: { title: string }, { user }) => {
  return prisma.group.create({
    data: {
      title,
      userId: user.id,
    },
  });
};
