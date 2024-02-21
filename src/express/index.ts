import express from "express";
import {
  YMFormPaymentType,
  YMNotificationChecker,
  YMNotificationError,
  YMPaymentFromBuilder,
} from "yoomoney-sdk";
import { amplitude, prisma } from "..";
import { config } from "dotenv";
import { bot } from "../bot";

config();

const BOT_URL = process.env.BOT_URL ?? "https://danya_vecher.t.me";
const DOMAIN = process.env.DOMAIN ?? "pay.bbbit.me";

const app = express();

app.use(express.json());
app.use(express.urlencoded());

if (!process.env.YOOMONEY_SECRET) throw new Error("YOOMONEY_SECRET not found");

app.get("/", (_, res) => res.send("ok"));

app.get("/success", (_req, res) => {
  res.redirect(BOT_URL);
});

app.get("/pay", async (req, res) => {
  const sum = Number(req.query.amount);
  const id = Number(req.query.id);

  if (!sum || !id) return;

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    amplitude.logEvent({
      event_type: "User pay: bad user id",
    });
    return res.redirect(BOT_URL);
  }

  const builder = new YMPaymentFromBuilder({
    quickPayForm: "shop",
    sum: sum,
    targets: "etst",
    successURL: `https://${DOMAIN}/success`,
    paymentType: YMFormPaymentType.FromCard,
    receiver: "4100116479863990",
    label: `${id}_${sum}`,
    comment: "ООООООО",
  });

  res.writeHead(200, "OK", {
    "Content-Type": "text/html; charset=utf-8",
  });

  res.end(builder.buildHtml(true));
});

const notificationChecker = new YMNotificationChecker(
  process.env.YOOMONEY_SECRET
);

app.post(
  "/webhook/payment",
  notificationChecker.middleware({ memo: false }, async (req, res) => {
    const id = Number(req.body.label.split("_")[0]);
    const amount = Number(req.body.label.split("_")[1]);
    if (!id) {
      amplitude.logEvent({
        event_type: "User pay: Empty label",
        event_properties: {
          amount: req.body.amount,
        },
      });
      res.writeHead(200, "OK", { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      amplitude.logEvent({
        event_type: "User pay: User not found",
        event_properties: {
          amount: req.body.amount,
        },
      });
      res.writeHead(200, "OK", { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    // TODO in transaction
    await prisma.user.update({
      where: { id: id },
      data: { balance: user.balance + amount },
    });

    if (user.referalId) {
      const referal = await prisma.user.findUnique({
        where: { id: user.referalId },
      });
      if (referal) {
        await prisma.user.update({
          where: { id: referal.id },
          data: {
            balance: {
              increment: amount * Number(process.env.REFERAL_FEE),
            },
          },
        });

        bot.api.sendMessage({
          chat_id: referal.id.toString(),
          text: `По вашей реферальной сслыке пополнилне баланс на ${amount} руб.\n\nВам на счет зачислено ${
            amount * Number(process.env.REFERAL_FEE)
          } руб`,
        });
      }
    }

    await bot.api.sendMessage({
      chat_id: user.id.toString(),
      text: `Баланс пополнен на ${amount} руб`,
    });

    await bot.api.sendMessage({
      chat_id: user.id.toString(),
      text: `Вернуться в главное меню\n/start`,
      //   reply_markup: mainMenu
    });

    amplitude.logEvent({
      event_type: "User pay: Success",
      user_id: req.body.label,
      event_properties: {
        amount: req.body.amount,
      },
    });

    res.writeHead(200, "OK", { "Content-Type": "text/plain" });
    res.end("ok");
  })
);

app.use((error: any, _req: any, _res: any, next: () => void) => {
  console.log("pay event use");
  if (error instanceof YMNotificationError) {
    amplitude.logEvent({
      event_type: "User pay: Bad sign",
    });
  }

  return next();
});

export const startServer = () => {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
  });
};
