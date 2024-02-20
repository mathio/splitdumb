import prisma from "../prisma";

export const createGroup = (
  _,
  { title, groupFriends }: { title: string; groupFriends: string },
  { user },
) => {
  const members = JSON.parse(groupFriends);
  return prisma.group.create({
    data: {
      title,
      userId: user.id,
      members: {
        connect: [
          { id: user.id },
          ...Object.keys(members)
            .filter((key) => members[key])
            .map((key) => ({ id: Number(key) })),
        ],
      },
    },
  });
};
