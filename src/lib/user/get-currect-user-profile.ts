import prisma from "../prisma";
import { GraphQLError } from "graphql";

export const getCurrentUserProfile = async (_, _args, { user }) => {
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { emails: true },
  });
  const emails = profile.emails.map(({ email }) => email);

  const pendingEmails = await prisma.verificationToken.findMany({
    where: {
      identifier: { notIn: emails },
      token: { startsWith: `${user.id}-` },
      expires: { gt: new Date() },
    },
  });

  return {
    ...profile,
    emails: [
      ...profile.emails.map(({ email }) => ({
        id: email,
        email,
        verified: true,
      })),
      ...pendingEmails.map(({ identifier }) => ({
        id: identifier,
        email: identifier,
        verified: false,
      })),
    ],
  };
};
