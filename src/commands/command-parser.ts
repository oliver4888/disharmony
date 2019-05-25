import { Logger } from "..";
import { IClient } from "../core/client"
import BotMessage from "../models/discord/message";
import Command from "./command"
import { CommandError, CommandErrorReason } from "./command-error";
import CommandRejection from "./command-rejection";

export default async function getCommandInvoker(client: IClient, message: BotMessage): Promise<((disharmonyClient: IClient, message: BotMessage) => Promise<string>) | null>
{
    let details: {
        name: string;
        params: string[];
    } | null

    let command: Command | undefined

    try
    {
        details = getCommandDetails(message, client)
        if (!details)
            return null

        command = client.commands.find(x => x.syntax.startsWith(details!.name))
        if (!command)
            return null
    }
    catch (err)
    {
        /* Suppress any errors that occur while we're not yet sure if this is a command.
           This is important because of the high volume of messages the bot receives, if something
           goes wrong with message parsing we don't want it to reply "an error occurred" to
           every single message it sees! */

        Logger.debugLogError(`Error determining if message contained command`, err)
        return null
    }

    if (!isUserPermitted(message, command))
        throw new CommandError(CommandErrorReason.UserMissingPermissions)
    else if (details.params.length < (command.syntax.match(/ [^ \[]+/g) || []).length)
        throw new CommandError(CommandErrorReason.IncorrectSyntax)
    else
        return async (invokeClient: IClient, invokeMessage: BotMessage) =>
        {
            await invokeMessage.guild.loadDocument()
            let out

            try
            {
                out = await command!.invoke(details!.params, invokeMessage, invokeClient)
            }
            catch (e)
            {
                if (e instanceof CommandRejection)
                    out = e.message
                else
                    throw e
            }

            await invokeMessage.guild.save()
            return out as string
        }
}

function isUserPermitted(message: BotMessage, command: Command)
{
    return message.member.getPermissionLevel() >= command.permissionLevel
}

function getCommandDetails(message: BotMessage, client: IClient)
{
    // if no command prefix exists for this guild command criteria is bot mention
    const commandPrefix = message.guild.commandPrefix || `^<@!?${client.botId}>`
    const regexp = new RegExp(`${commandPrefix} ?([^ ]+)(?: ([^ ].*))?`)
    const result = regexp.exec(message.content)
    return !result ? null :
        {
            name: result[1],
            params: result[2] ? result[2].split(/ +/) : [],
        }
}