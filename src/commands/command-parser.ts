import { IClient } from "../core/client"
import BotMessage from "../models/discord/message";
import Command from "./command"
import { CommandError, CommandErrorReason } from "./command-error";
import CommandRejection from "./command-rejection";

export default async function getCommandInvoker(client: IClient, message: BotMessage): Promise<((disharmonyClient: IClient, message: BotMessage) => Promise<string>) | null>
{
    const details = getCommandDetails(message, client)
    if (!details)
        return null

    const command = client.commands.find(x => x.syntax.startsWith(details.name))
    if (!command)
        return null

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
                out = await command.invoke(details.params, invokeMessage, invokeClient)
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