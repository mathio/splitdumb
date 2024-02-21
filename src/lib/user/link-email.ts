import { GraphQLError } from "graphql/index";
import prisma from "../prisma";

export const linkEmail = async (_, { token }: { token: string }, { user }) => {
  await prisma.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  const [tokenUserId] = token.split("-");

  if (Number(tokenUserId) !== user.id) {
    throw new GraphQLError("Unauthorized");
  }

  const verificationRecord = await prisma.verificationToken.findUnique({
    where: { token, expires: { gt: new Date() } },
  });

  if (!verificationRecord) {
    throw new GraphQLError("Unauthorized");
  }

  await prisma.email.create({
    data: {
      email: verificationRecord.identifier,
      user: { connect: { id: user.id } },
    },
  });
  await prisma.verificationToken.delete({
    where: { id: verificationRecord.id },
  });

  return prisma.user.findUnique({
    where: { id: user.id },
    include: { emails: true },
  });
};
