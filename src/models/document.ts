import getDbClient, { IDbClient } from "../database/db-client";
import Record from "./record";
import logger from "../utilities/logger";

export default abstract class Document extends Record
{
    private dbClient: IDbClient

    public save()
    {
        this.record._id = this.id
        this.dbClient.upsertOne(this.constructor.name, { _id: this.id }, this.record)
    }

    public deleteRecord()
    {
        this.dbClient.deleteOne(this.constructor.name, { _id: this.id })
    }

    public async loadDocument()
    {
        try
        {
            const record = await this.dbClient.findOne(this.constructor.name, { _id: this.id })
            this.loadRecord(record || {})
        }
        catch{
            logger.consoleLog(`Error loading document for Guild ${this.id}`)
            throw "Error loading data, please contact the host"
        }
    }

    constructor(
        public id: string,
        dbClient?: IDbClient
    )
    {
        super()
        this.dbClient = dbClient || getDbClient()
    }
}