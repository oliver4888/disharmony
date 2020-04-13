import { RichEmbed } from "discord.js"
import Command, { PermissionLevel } from "../commands/command"
import { Client } from "../core/client"
import DisharmonyGuildMember from "../models/discord/disharmony-guild-member"
import DisharmonyMessage from "../models/discord/disharmony-message"

async function invoke(_: string[], message: DisharmonyMessage, client: Client): Promise<void>
{
    await message.reply(createHelpEmbed(client, message.guild.me, message.member))
}

function createHelpEmbed(client: Client, me: DisharmonyGuildMember, member: DisharmonyGuildMember): RichEmbed
{
    const embed = new RichEmbed().setTitle(`__${client.config.serviceName} help__`)

    const displayableCommands =
        client.commands
            .filter(x => x.permissionLevel <= member.getPermissionLevel()) // Show only commands available to this user
            .filter(x => !x.hidden) // Don't show hidden commands
            .sort((a, b) => a.syntax <= b.syntax ? 0 : 1) // Sort commands alphabetically by syntax

    for (const command of displayableCommands)
        embed.addField(command.syntax.match(/^\s?[^\s]+/)![0],
            `${command.description}
            **Usage:** *@${me.nickname || me.username} ${command.syntax}*
            ${command.permissionLevel !== PermissionLevel.Anyone ? `***${PermissionLevel[command.permissionLevel]} only***` : ""}`,
        )

    embed.addField("__Need more help?__",
        "[Visit my website](https://bots.ol48.uk/) or [Join my Discord](https://discord.gg/ZEPjFJX)")

    return embed
}

export default new Command(
    /*syntax*/          "help",
    /*description*/     "Display available commands with descriptions",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke,
)