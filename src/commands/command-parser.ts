import { IClient } from "../client"
import Command from "./command"
import Message from "../models/discord/message";

export default async function getCommandInvoker(client: IClient, message: Message): Promise<((disharmonyClient: IClient, message: Message) => Promise<string>) | null>
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
        return async (client: IClient, message: Message) =>
        {
            try
            {
                await message.guild.loadDocument()
                const out = await command.invoke(details.params, message, client);
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

function getCommandDetails(message: Message, client: IClient)
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