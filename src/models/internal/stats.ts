import { Client as DjsClient } from "discord.js"

export default class Stats {
    public get guildCount() { return this.dClient.guilds.cache.size }
    public get userCount() { return this.dClient.users.cache.size }
    public get uptime() { return this.dClient.uptime }
    public get uptimeStr() { return this.toHHMMSS(this.uptime || 0) }

    private toHHMMSS(ms: number) {
        const secsTruncated = Math.trunc(ms / 1000)
        const hrs = Math.floor(secsTruncated / 3600)
        const mins = Math.floor((secsTruncated - (hrs * 3600)) / 60)
        const secs = secsTruncated - (hrs * 3600) - (mins * 60)

        let hoursStr = hrs.toString(), minsStr = mins.toString(), secsStr = secs.toString()

        if (hrs < 10) hoursStr = "0" + hrs
        if (mins < 10) minsStr = "0" + mins
        if (secs < 10) secsStr = "0" + secs
        return `${hoursStr}:${minsStr}:${secsStr}`
    }

    public constructor(private dClient: DjsClient) { }
}