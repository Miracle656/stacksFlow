import Telegraf from "telegraf";
import { Context } from "telegraf";

export type BotContext = Context;
export type Bot = Telegraf<BotContext>;
