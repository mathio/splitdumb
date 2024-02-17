import prisma from "./prisma";

export const deletePayment = async (_, { id }: { id: string }) => {
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
  });

  if (payment) {
    await prisma.payment.delete({
      where: { id: Number(id) },
    });
  }
  return { id, groupId: payment.groupId };
};
