import prisma from "./prisma";

export const createGroup = (_, { title }: { title: string }) => {
  return prisma.group.create({
    data: {
      title,
      userId: 1,
    },
  });
};
