import { prisma, amplitude } from "..";

async function createUser({
  senderId,
  username,
  referalId,
}: {
  senderId: number;
  username: string;
  referalId?: number;
}) {
  const user = await prisma.user.findUnique({ where: { id: senderId } });
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        id: senderId,
        nickname: username,
        referalId: referalId || null,
      },
    });

    amplitude.logEvent({
      event_type: "New user",
      user_id: newUser.id.toString(),
      user_properties: {
        tgNick: newUser.nickname,
        refId: newUser.referalId,
      },
    });
  }
}

export default createUser;
