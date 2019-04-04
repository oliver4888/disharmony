import Command, { PermissionLevel } from "../commands/command"
import BotMessage from "../models/discord/message"
import { IClient } from "../client"
import { RichEmbed } from "discord.js"
import BotGuildMember from "../models/discord/guild-member";

function invoke(params: string[], message: BotMessage, client: IClient): Promise<void>
{
    message.reply(createHelpEmbed(client, message.guild.me, message.member))
    return Promise.resolve()
}

function createHelpEmbed(client: IClient, me: BotGuildMember, member: BotGuildMember): RichEmbed
{
    const embed = new RichEmbed().setTitle(`__${client.name} help__`)

    for (let command of client.commands.filter(x => x.permissionLevel <= member.getPermissionLevel()))
        embed.addField(command.name,
            `${command.description}
            **Usage:** *@${me.nickname || me.username} ${command.syntax}*
            ${command.permissionLevel !== PermissionLevel.Anyone ? `***${PermissionLevel[command.permissionLevel]} only***` : ""}`
        )

    embed.addField("__Need more help?__",
        "[Visit my website](https://benji7425.github.io) or [Join my Discord](https://discord.gg/SSkbwSJ)")

    return embed
}

module.exports = new Command(
    /*name*/            "help",
    /*description*/     "Display available commands with descriptions",
    /*syntax*/          "help",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke
)