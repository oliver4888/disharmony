import { RichEmbed } from "discord.js"
import Command, { PermissionLevel } from "../commands/command"
import { IClient } from "../core/client"
import BotGuildMember from "../models/discord/guild-member"
import BotMessage from "../models/discord/message"

async function invoke(_: string[], message: BotMessage, client: IClient): Promise<void>
{
    await message.reply(createHelpEmbed(client, message.guild.me, message.member))
}

function createHelpEmbed(client: IClient, me: BotGuildMember, member: BotGuildMember): RichEmbed
{
    const embed = new RichEmbed().setTitle(`__${client.config.serviceName} help__`)

    for (const command of client.commands.filter(x => x.permissionLevel <= member.getPermissionLevel()))
        embed.addField(command.syntax.match(/^\s?[^\s]+/)![0],
            `${command.description}
            **Usage:** *@${me.nickname || me.username} ${command.syntax}*
            ${command.permissionLevel !== PermissionLevel.Anyone ? `***${PermissionLevel[command.permissionLevel]} only***` : ""}`,
        )

    embed.addField("__Need more help?__",
        "[Visit my website](https://benji7425.github.io) or [Join my Discord](https://discord.gg/SSkbwSJ)")

    return embed
}

export default new Command(
    /*syntax*/          "help",
    /*description*/     "Display available commands with descriptions",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke,
)