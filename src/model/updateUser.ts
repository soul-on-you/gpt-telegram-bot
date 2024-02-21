import { prisma, amplitude } from "..";

export async function updateUserLikes({
  senderId,
  theme,
}: {
  senderId: number;
  theme: string;
}) {
  const user = await prisma.user.update({
    where: { id: senderId },
    data: { likes: { increment: 1 } },
  });

  // amplitude.logEvent({
  //   event_type: "Good essay",
  //   user_id: senderId.toString(),
  //   event_properties: {
  //     theme: theme,
  //   },
  //   user_properties: {
  //     tgNick: user.nickname,
  //     likeBefore: user.likes - 1,
  //     likeAfter: user.likes,
  //   },
  // });
}

export async function updateUserRequests({
  senderId,
  theme,
  changes,
}: {
  senderId: number;
  theme: string;
  changes?: string;
}) {
  const user = await prisma.user.update({
    where: { id: senderId },
    data: { requests: { increment: 1 } },
  });

  // amplitude.logEvent({
  //   event_type: "Rewrite essay",
  //   user_id: senderId.toString(),
  //   event_properties: {
  //     theme: theme,
  //     changes: changes,
  //   },
  //   user_properties: {
  //     tgNick: user.nickname,
  //     likeBefore: user.requests - 1,
  //     likeAfter: user.requests,
  //   },
  // });
}
