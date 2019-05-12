import { Message as DjsMessage } from "discord.js";
import { BotMessage, Client, IClient } from "..";
import getCommandInvoker, { RejectionReason } from "../commands/command-parser";

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
                throw RejectionReason.BotMissingGuildPermissions

            const result = await commandInvoker(client, message)
            if (result)
                await message.reply(result)
        }
    }
    catch (reason)
    {
        if (reason in RejectionReason)
            await message.reply(getRejectionMsg(reason))
    }

    client.dispatchMessage(message)
}

function getRejectionMsg(reason: RejectionReason)
{
    switch (reason)
    {
        case RejectionReason.UserMissingPermissions:
            return "You do not have permission to use this command."
        case RejectionReason.IncorrectSyntax:
            return "Incorrect syntax! See correct syntax with the `help` command."
        case RejectionReason.BotMissingGuildPermissions:
            return "The bot has not been granted the necessary permissions in this server. Please grant the permissions and try again. Details can be found in the readme you used to invite the bot to your server."
    }
}