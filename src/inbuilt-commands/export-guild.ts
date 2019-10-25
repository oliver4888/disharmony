import { Command, DisharmonyMessage, PermissionLevel } from ".."
import PendingDataPorts from "../models/internal/pending-data-ports"

async function invoke(_: string[], message: DisharmonyMessage)
{
    const pendingList = new PendingDataPorts()
    await pendingList.loadDocument()

    const guildId = message.guild.id
    const memberId = message.member.id

    if (pendingList.allPending.find(x => x.guildId === guildId && x.memberId === memberId))
        return "You already have a pending export for this server!"

    pendingList.allPending.push({
        guildId,
        memberId,
        isImport: false,
    })

    await pendingList.save()
    return "Your export will be generated in the background and should be private messaged to you within one hour. Please make sure you allow direct messages from server members."
}

export default new Command(
    /*syntax*/          "export",
    /*description*/     "Export data from this guild in JSON format",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)