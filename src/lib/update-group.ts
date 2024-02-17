import prisma from "./prisma";

export const updateGroup = (
  _,
  { id, title }: { id: string; title: string },
) => {
  return prisma.group.update({
    where: { id: Number(id) },
    data: {
      title,
    },
  });
};
