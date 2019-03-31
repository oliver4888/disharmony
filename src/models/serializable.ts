import getDbClient, { IDbClient } from "../database/db-client";

export default abstract class Serializable
{
    private dbClient: IDbClient
    protected record: any
    public id: string

    public save()
    {
        this.dbClient.upsertOne(this.constructor.name, { _id: this.id }, this.record)
    }

    public deleteRecord()
    {
        this.dbClient.deleteOne(this.constructor.name, { _id: this.id })
    }

    public async loadRecord(id: string)
    {
        try
        {
            this.id = id
            this.record = await this.dbClient.findOne(this.constructor.name, { _id: id })
        }
        catch
        {
            this.record = {}
        }
        return this
    }

    constructor(dbClient?: IDbClient)
    {
        this.dbClient = dbClient || getDbClient()
    }
}