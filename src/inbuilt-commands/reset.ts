import { CommandRejection, Logger } from ".."
import Command, { PermissionLevel } from "../commands/command"
import { Client } from "../core/client"
import BotMessage from "../models/discord/message"
import { EventStrings } from "../utilities/logging/event-strings"
import Question from "../utilities/question"

async function invoke(_: string[], message: BotMessage, client: Client)
{
    return new Promise<string>(async (__, reject) =>
    {
        const response = await new Question(
            client, message.channelId,
            "Are you sure you want to delete all the data for this server? (yes/no)",
            message.member, true).send()

        if (response.content.toLowerCase() === "yes")
        {
            await message.guild.deleteRecord()
            Logger.logEvent(EventStrings.GuildReset, { guildId: message.guild.id })

            /* This is a very hacky way of doing this, but when using resolve
               the Guild object gets saved back to the database straight away,
               meaning it'd be deleted and instnantly re-created. Using reject
               means that save doesn't get called by the parent. Very hacky but works. */
            reject(new CommandRejection("Data for this server successfully deleted"))
        }
        else
            reject(new CommandRejection("Data was not deleted"))
    })
}

export default new Command(
    /*syntax*/          "reset",
    /*description*/     "Reset all data for this Discord server. WARNING: YOU WILL LOSE ALL YOUR SETTINGS!",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)