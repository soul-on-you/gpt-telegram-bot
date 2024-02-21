import { prisma, amplitude } from "..";

async function updateUserBalance({
  senderId,
  amount,
}: {
  senderId: number;
  amount: number;
}) {
  const user = await prisma.user.update({
    where: { id: senderId },
    data: { balance: { increment: amount } },
  });

  amplitude.logEvent({
    event_type: "Update user balance",
    user_id: senderId.toString(),
    user_properties: {
      tgNick: user.nickname,
      balanceBefore: user.balance - amount,
      balanceAfter: user.balance,
      updateAmount: amount,
    },
  });
}

export default updateUserBalance;