import prisma from "./prisma";
import { userIsMemberOfGroup } from "./get-group";

export const deletePayment = async (_, { id }: { id: string }, { user }) => {
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
  });

  await userIsMemberOfGroup(user.id, payment.groupId);

  if (payment) {
    await prisma.payment.delete({
      where: { id: Number(id) },
    });
  }
  return { id, groupId: payment.groupId };
};
