import { Message as DjsMessage } from "discord.js"
import { Client, DisharmonyClient, DisharmonyMessage, Logger } from ".."
import { CommandError, CommandErrorReason } from "../commands/command-error"
import getCommandInvoker from "../commands/command-parser"
import { EventStrings } from "../utilities/logging/event-strings"

export default async function handleMessage<TMessage extends DisharmonyMessage>(
    client: DisharmonyClient<TMessage>,
    djsMessage: DjsMessage,
    innerGetCommandInvoker?: (client: Client, message: DisharmonyMessage) => Promise<((disharmonyClient: Client, message: DisharmonyMessage) => Promise<string>) | null>) {
    // Ignore messages from self
    if (djsMessage.author.id === djsMessage.client.user?.id)
        return

    const message = new client.messageCtor(djsMessage)

    try {
        const commandInvoker = await (innerGetCommandInvoker ? innerGetCommandInvoker!(client, message) : getCommandInvoker(client, message))
        if (commandInvoker) {
            if (!message.guild.botHasPermissions(client.config.requiredPermissions))
                throw new CommandError(CommandErrorReason.BotMissingGuildPermissions)

            const result = await commandInvoker(client, message)
            if (result)
                await message.reply(result)
        }
    }
    catch (err) {
        await Logger.debugLogError(`Error invoking command in guild ${message.guild.id}`, err)
        if (err && (err as CommandError).reason === CommandErrorReason.BotMissingGuildPermissions)
            await Logger.logEvent(EventStrings.MissingGuildPermissions, { guildId: message.guild.id })
        else
            await Logger.logEvent(EventStrings.InvokeCommandError, { guildId: message.guild.id })

        await message.reply(err.friendlyMessage || "An unknown error occurred.")
    }

    client.dispatchMessage(message)
}