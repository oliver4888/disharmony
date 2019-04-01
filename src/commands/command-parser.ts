import Client from "../client"
import Command from "./command"
import Message from "../models/discord/message";

export default async function getCommandInvoker(client: Client, message: Message): Promise<((disharmonyClient: Client, message: Message) => Promise<string>) | null>
{
    const details = getCommandDetails(message, client)
    if (!details) return null

    const command = client.commands.find(x => x.syntax.startsWith(details.name))
    if (!command) return null

    if (!isUserPermitted(message, command))
        throw RejectionReason.MissingPermission
    else if (details.params.length < (command.syntax.match(/ [^ \[]+/g) || []).length)
        throw RejectionReason.IncorrectSyntax
    else
        return async (disharmonyClient: Client, message: Message) =>
        {
            try
            {
                const out = await command.invoke(details.params, message, disharmonyClient);
                message.guild.save();
                return out as string;
            }
            catch (err) { return err.message || err; }
        }
}

function isUserPermitted(message: Message, command: Command)
{
    return message.member.getPermissionLevel() >= command.permissionLevel
}

function getCommandDetails(message: Message, client: Client)
{
    //if no command prefix exists for this guild command criteria is bot mention
    const commandPrefix = message.guild.commandPrefix || `^<@!?${client.botID}>`
    const regexp = new RegExp(`${commandPrefix} ?([^ ]+)(?: ([^ ].*))?`)
    const result = regexp.exec(message.content)
    return !result ? null :
        {
            name: result[1],
            params: result[2] ? result[2].split(/ +/) : []
        }
}

export enum RejectionReason
{
    MissingPermission,
    IncorrectSyntax
}