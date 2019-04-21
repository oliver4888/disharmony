import { Message as DjsMessage } from "discord.js";
import { Client, BotMessage, IClient } from "..";
import getCommandInvoker, { RejectionReason } from "../commands/command-parser";

export default async function handleMessage<TMessage extends BotMessage>(
    client: Client<TMessage>,
    djsMessage: DjsMessage,
    innerGetCommandInvoker?: (client: IClient, message: BotMessage) => Promise<((disharmonyClient: IClient, message: BotMessage) => Promise<string>) | null>)
{
    //ignore messages from self
    if (djsMessage.member.id === djsMessage.member.guild.me.id)
        return

    const message = new client.messageCtor(djsMessage)

    try
    {
        const commandInvoker = await (innerGetCommandInvoker ? innerGetCommandInvoker!(client, message) : getCommandInvoker(client, message))
        if (commandInvoker)
        {
            const result = await commandInvoker(client, message)
            if (result)
                message.reply(result)
        }
    }
    catch (reason)
    {
        if (reason in RejectionReason)
            message.reply(getRejectionMsg(reason))
    }

    client.dispatchMessage(message)
}

function getRejectionMsg(reason: RejectionReason)
{
    switch (reason)
    {
        case RejectionReason.MissingPermission:
            return "You do not have permission to use this command."
        case RejectionReason.IncorrectSyntax:
            return "Incorrect syntax! See correct syntax with the `help` command."
    }
}