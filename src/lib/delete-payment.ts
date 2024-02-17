import prisma from "./prisma";

export const deletePayment = async (_, { id }: { id: number }) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (payment) {
    await prisma.payment.delete({
      where: { id },
    });
  }
  return { id, groupId: payment.groupId };
};
