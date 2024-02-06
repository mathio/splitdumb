import prisma from "../../lib/prisma";

export default async (req, res) => {
  const group = await prisma.group.findUnique({ where: { id: 1 } });
  res.json({ group });
};
