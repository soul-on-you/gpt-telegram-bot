import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import * as Amplitude from "@amplitude/node";
import { startBot } from "./bot";
import { startServer } from "./express";

dotenv.config();

export const prisma = new PrismaClient();

if (!process.env.BOT_TOKEN) throw new Error("Token not found");
if (!process.env.YOOMONEY_SECRET) throw new Error("YOOMONEY_SECRET not found");
if (!process.env.AMPLITUDE_KEY) throw new Error("AMPLITUDE_KEY not found");

export const amplitude = Amplitude.init(process.env.AMPLITUDE_KEY);

amplitude.logEvent({
  event_type: "Bot restart",
});

startBot();
startServer();
