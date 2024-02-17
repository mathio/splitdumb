import prisma from "./prisma";

export const createPayment = async (
  _,
  {
    sum,
    groupId,
    senderId,
    receiverId,
  }: { sum: number; groupId: number; senderId: number; receiverId: number },
) => {
  const { id } = await prisma.payment.create({
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
