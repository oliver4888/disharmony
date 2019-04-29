import { LightClient } from "..";

export default abstract class ClientWorker
{
    protected client: LightClient

    public async connect()
    {
        await this.client.initialize(this.token)
    }

    public async disconnect()
    {
        await this.client.destroy()
    }

    constructor(
        private token: string,
        dbConnectionString: string
    )
    {
        this.client = new LightClient(dbConnectionString)
    }
}