import prisma from "../prisma";

export const getFriends = async (_, args, { user }) => {
  const { friend } = await prisma.user.findUnique({
    where: { id: user.id },
    include: { friend: { orderBy: { name: "asc" } } },
  });
  return friend;
};
