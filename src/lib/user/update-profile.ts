import { sha256 } from "js-sha256";
import prisma from "../prisma";
import { sendEmail } from "../email-providers";

export const updateProfile = async (
  _,
  {
    name,
    emails,
    primaryEmail,
  }: { name: string; emails?: string[]; primaryEmail?: string },
  { user },
) => {
  const profile = await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  if (emails) {
    const existingEmails = (
      await prisma.email.findMany({ where: { userId: user.id } })
    ).map(({ email }) => email);
    const pendingEmails = (
      await prisma.verificationToken.findMany({
        where: {
          token: { startsWith: `${user.id}-` },
          expires: { gt: new Date() },
        },
      })
    ).map(({ identifier }) => identifier);
    const allEmails = [...existingEmails, ...pendingEmails];

    const newEmails = emails.filter((email) => !allEmails.includes(email));
    const deleteEmails = allEmails.filter((email) => !emails.includes(email));

    console.log("emails", emails);
    console.log("allEmails", allEmails);
    console.log("newEmails", newEmails);
    console.log("deleteEmails", deleteEmails);

    await prisma.email.deleteMany({
      where: { userId: user.id, email: { in: deleteEmails } },
    });
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: { in: deleteEmails },
        token: { startsWith: `${user.id}-` },
      },
    });

    const expires = new Date();
    expires.setDate(expires.getDate() + 1);

    const data = newEmails.map((identifier) => ({
      identifier,
      token: `${user.id}-${sha256(`${identifier}${process.env.SECRET}${Date.now()}`)}`,
      expires,
    }));
    await prisma.verificationToken.createMany({ data });

    data.forEach(({ identifier, token }) => {
      const url = `http://localhost:3000/me?linkEmail=${token}`;
      sendEmail(
        {
          name: "💸 Splitdumb",
          email: process.env.BREVO_EMAIL_SENDER_ADDRESS,
        },
        identifier,
        "Add address to your account",
        `<body style="font-size:16px;font-family:sans-serif;color:black;">
        <p>Hello,</p>
        <p>This is Splitdumb. It is not very wise.</p>
        <p>Would you like to link this email address to your existing account?</p>
        <p><a href="${url}" target="_blank" style="font-size:16px;font-family:sans-serif;color:white;text-decoration:none;border-radius:5px;padding:8px 14px;background:black;display:inline-block;font-weight: bold;">Yes, link this email address</a></p>
        <p style="color:gray;font-size:12px;margin-top:30px;">If you did not request this email you can safely ignore it.</p>
        </body>`,
      );
    });
  }

  if (
    primaryEmail &&
    primaryEmail !== user.email &&
    emails.includes(primaryEmail)
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { email: primaryEmail },
    });
    await prisma.email.delete({
      where: { userId: user.id, email: primaryEmail },
    });
    await prisma.email.create({
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  }

  await prisma.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  return profile;
};
