import prisma from "./prisma";

export const getGroups = async () => {
  return prisma.group.findMany();
};
