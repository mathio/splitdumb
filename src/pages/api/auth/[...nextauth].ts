import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import { EmailConfig } from "next-auth/src/providers/email";
import { sendEmail } from "../../../lib/email-providers";
import { sha256 } from "js-sha256";

const CustomEmailProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  from: "root@localhost",
  maxAge: 15 * 60,
  options: undefined,
  server: undefined,
  sendVerificationRequest: async ({ identifier, url }) => {
    const result = await sendEmail(
      {
        name: "💸 Splitdumb",
        email: process.env.BREVO_EMAIL_SENDER_ADDRESS,
      },
      identifier,
      "Login",
      `<body style="font-size:16px;font-family:sans-serif;color:black;">
       <p>Hello,</p>
       <p>This is Splitdumb. It is not very wise.</p>
       <p><a href="${url}" target="_blank" style="font-size:16px;font-family:sans-serif;color:white;text-decoration:none;border-radius:5px;padding:8px 14px;background:black;display:inline-block;font-weight: bold;">Click here to log in</a></p>
       <p style="color:gray;font-size:12px;margin-top:30px;">If you did not request this email you can safely ignore it.</p>
       </body>`,
    );
    console.log("email result", result);
  },
};

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const adapter = PrismaAdapter(prisma);

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    }),
    CustomEmailProvider,
  ],
  adapter: {
    ...adapter,
    createUser: (user) => {
      if (!user.name) {
        user.name = user.email
          .split("@")
          .at(0)
          .split(".")
          .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
          .join(" ");
      }
      if (!user.image) {
        const hash = sha256(user.email.trim().toLowerCase());
        user.image = `https://www.gravatar.com/avatar/${hash}`;
      }
      return adapter.createUser(user);
    },
  },
  secret: process.env.SECRET,
  callbacks: {
    session({ session, user }) {
      if (user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
