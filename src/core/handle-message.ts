import { Message as DjsMessage } from "discord.js";
import { BotMessage, Client, IClient, Logger } from "..";
import { CommandError, CommandErrorReason } from "../commands/command-error";
import getCommandInvoker from "../commands/command-parser";

export default async function handleMessage<TMessage extends BotMessage>(
    client: Client<TMessage>,
    djsMessage: DjsMessage,
    innerGetCommandInvoker?: (client: IClient, message: BotMessage) => Promise<((disharmonyClient: IClient, message: BotMessage) => Promise<string>) | null>)
{
    // ignore messages from self
    if (djsMessage.member.id === djsMessage.member.guild.me.id)
        return

    const message = new client.messageCtor(djsMessage)

    try
    {
        const commandInvoker = await (innerGetCommandInvoker ? innerGetCommandInvoker!(client, message) : getCommandInvoker(client, message))
        if (commandInvoker)
        {
            if (!message.guild.hasPermissions(client.config.requiredPermissions))
                throw new CommandError(CommandErrorReason.BotMissingGuildPermissions)

            const result = await commandInvoker(client, message)
            if (result)
                await message.reply(result)
        }
    }
    catch (err)
    {
        Logger.debugLogError(`Error invoking command in guild ${message.guild.id}`, err)
        await message.reply(err.friendlyMessage || "An unknown error occurred.")
    }

    client.dispatchMessage(message)
}