import { prisma, amplitude } from "..";

async function getUser({ senderId }: { senderId: number }) {
  const user = await prisma.user.findUnique({
    where: { id: senderId },
  });

  return user;
}

export default getUser;
