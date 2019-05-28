import { CommandRejection } from "..";
import Command, { PermissionLevel } from "../commands/command"
import { IClient } from "../core/client"
import BotMessage from "../models/discord/message"

async function invoke(_: string[], message: BotMessage, client: IClient)
{
    return new Promise<string>(async (resolve, reject) =>
    {
        const response = await BotMessage.ask(
            client, message.channelId,
            "Are you sure you want to delete all the data for this server? (yes/no)",
            message.member, true)

        /* This is a very hacky way of doing this, but when using resolve
           the Guild object gets saved back to the database straight away,
           meaning it'd be deleted and instnantly re-created. Using reject
           means that save doesn't get called by the parent. Very hacky but works. */

        if (response.content.toLowerCase() === "yes")
        {
            await message.guild.deleteRecord()
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