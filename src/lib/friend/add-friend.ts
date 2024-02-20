import prisma from "../prisma";

export const addFriend = async (
  _,
  { name, email }: { name: string; email: string },
  { user },
) => {
  const friend = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { friend: { connect: { id: friend.id } } },
  });

  return friend;
};
