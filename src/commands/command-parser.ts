import { Logger } from ".."
import { Client } from "../core/client"
import DisharmonyMessage from "../models/discord/disharmony-message"
import { EventStrings } from "../utilities/logging/event-strings"
import Command from "./command"
import { CommandError, CommandErrorReason } from "./command-error"
import CommandRejection from "./command-rejection"

export default async function getCommandInvoker(client: Client, message: DisharmonyMessage): Promise<((disharmonyClient: Client, message: DisharmonyMessage) => Promise<string>) | null> {
    let details: {
        name: string;
        params: string[];
    } | null

    let command: Command | undefined

    try {
        details = getCommandDetails(message, client)
        if (!details)
            return null

        command = client.commands.find(x => x.syntax.startsWith(details!.name))
        if (!command)
            return null
    }
    catch (err) {
        /* Suppress any errors that occur while we're not yet sure if this is a command.
           This is important because of the high volume of messages the bot receives, if something
           goes wrong with message parsing we don't want it to reply "an error occurred" to
           every single message it sees! */

        await Logger.debugLogError(`Error determining if message contained command`, err)
        await Logger.logEvent(EventStrings.DetermineCommandError)
        return null
    }

    if (!isUserPermitted(message, command))
        throw new CommandError(CommandErrorReason.UserMissingPermissions)
    else if (details.params.length < (command.syntax.match(/\s[^\s\[]+/g) || []).length)
        throw new CommandError(CommandErrorReason.IncorrectSyntax)
    else
        return async (invokeClient: Client, invokeMessage: DisharmonyMessage) => {
            await invokeMessage.guild.loadDocument()
            let out

            try {
                out = await command!.invoke(details!.params, invokeMessage, invokeClient)
            }
            catch (e) {
                if (e instanceof CommandRejection)
                    out = e.message
                else
                    throw e
            }

            await invokeMessage.guild.save()
            return out as string
        }
}

function isUserPermitted(message: DisharmonyMessage, command: Command) {
    return message.member.getPermissionLevel() >= command.permissionLevel
}

function getCommandDetails(message: DisharmonyMessage, client: Client) {
    // If no command prefix exists for this guild command criteria is bot mention
    const commandPrefix = message.guild.commandPrefix || `^<@!?${client.botId}>`
    const regexp = new RegExp(`${commandPrefix}\\s+([^\\s]+)(?:\\s+(.*))?`)
    const result = regexp.exec(message.content)
    return !result ? null :
        {
            name: result[1],
            params: result[2] ? result[2].split(/\s+/) : [],
        }
}