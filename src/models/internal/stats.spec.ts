import { Expect, Setup, Test, TestFixture } from "alsatian"
import { Client as DjsClient } from "discord.js"
import { IMock, Mock } from "typemoq"
import Stats from "./stats"

@TestFixture("Stats model transformations")
export class StatsTestFixture {
    private djsClient: IMock<DjsClient>

    @Setup
    public setup() {
        this.djsClient = Mock.ofType<DjsClient>()
    }

    @Test()
    public zero_hour_zero_minute_uptime_string_correct() {
        // ARRANGE
        this.djsClient
            .setup(x => x.uptime)
            .returns(() => 15 * 1000)

        // ACT
        const sut = new Stats(this.djsClient.object)

        // ASSERT
        Expect(sut.uptimeStr).toBe("00:00:15")
    }

    @Test()
    public zero_hour_multi_minute_uptime_string_correct() {
        // ARRANGE
        this.djsClient
            .setup(x => x.uptime)
            .returns(() => 1815 * 1000)

        // ACT
        const sut = new Stats(this.djsClient.object)

        // ASSERT
        Expect(sut.uptimeStr).toBe("00:30:15")
    }

    @Test()
    public multi_hour_multi_minute_uptime_string_correct() {
        // ARRANGE
        this.djsClient
            .setup(x => x.uptime)
            .returns(() => 5415 * 1000)

        // ACT
        const sut = new Stats(this.djsClient.object)

        // ASSERT
        Expect(sut.uptimeStr).toBe("01:30:15")
    }
}