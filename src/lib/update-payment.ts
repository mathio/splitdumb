import prisma from "./prisma";

export const updatePayment = async (
  _,
  {
    id,
    sum,
    groupId,
    senderId,
    receiverId,
  }: {
    id: number;
    sum: number;
    groupId: number;
    senderId: number;
    receiverId: number;
  },
) => {
  await prisma.payment.update({
    where: { id },
    data: {
      sum,
      groupId,
      senderId,
      receiverId,
    },
  });
  await prisma.group.update({
    where: { id: groupId },
    data: {
      updatedAt: new Date(),
    },
  });

  return prisma.payment.findUnique({
    where: { id },
    include: {
      sender: true,
      receiver: true,
    },
  });
};
