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
    id: string;
    sum: number;
    groupId: string;
    senderId: string;
    receiverId: string;
  },
) => {
  await prisma.payment.update({
    where: { id: Number(id) },
    data: {
      sum,
      groupId: Number(groupId),
      senderId: Number(senderId),
      receiverId: Number(receiverId),
    },
  });
  await prisma.group.update({
    where: { id: Number(groupId) },
    data: {
      updatedAt: new Date(),
    },
  });

  return prisma.payment.findUnique({
    where: { id: Number(id) },
    include: {
      sender: true,
      receiver: true,
    },
  });
};
