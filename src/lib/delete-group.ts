import prisma from "./prisma";

export const deleteGroup = async (_, { id }: { id: string }) => {
  try {
    await prisma.group.delete({
      where: { id: Number(id) },
    });
  } catch (e) {}
  return { id };
};
