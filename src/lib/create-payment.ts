import prisma from "./prisma";
import { userIsMemberOfGroup } from "./get-group";

export const createPayment = async (
  _,
  {
    sum,
    groupId,
    senderId,
    receiverId,
  }: { sum: number; groupId: string; senderId: string; receiverId: string },
  { user },
) => {
  await userIsMemberOfGroup(user.id, groupId);

  const { id } = await prisma.payment.create({
    data: {
      sum,
      group: { connect: { id: Number(groupId) } },
      sender: { connect: { id: Number(senderId) } },
      receiver: { connect: { id: Number(receiverId) } },
      user: { connect: { id: user.id } },
    },
  });
  await prisma.group.update({
    where: { id: Number(groupId) },
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
