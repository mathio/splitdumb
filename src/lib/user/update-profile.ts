import prisma from "../prisma";

export const updateProfile = (_, { name }: { name: string }, { user }) => {
  return prisma.user.update({
    where: { id: user.id },
    data: { name },
  });
};
