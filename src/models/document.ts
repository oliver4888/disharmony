import getDbClient, { IDbClient } from "../database/db-client";
import Serializable from "./serializable";
import logger from "../utilities/logger";

export default abstract class Document extends Serializable
{
    private dbClient: IDbClient
    private updateFields: any = {}
    private isNewRecord = false

    public async save()
    {
        this.record._id = this.id

        if (this.isNewRecord)
            await this.dbClient.insertOne(this.constructor.name, this.toRecord())
        else if (Object.keys(this.updateFields).length > 0)
        {
            await this.dbClient.updateOne(this.constructor.name, { _id: this.id }, { $set: this.updateFields })
            this.updateFields = {}
        }
    }

    public async deleteRecord()
    {
        await this.dbClient.deleteOne(this.constructor.name, { _id: this.id })
    }

    public addSetOperator(field: string, value: any)
    {
        this.updateFields[field] = value
    }

    public async loadDocument()
    {
        try
        {
            const record = await this.dbClient.findOne(this.constructor.name, { _id: this.id })
            const recordProxy = new Proxy(record || {}, {
                get: (target, prop) => target[prop],
                set: (target, prop, value) =>
                {
                    target[prop] = value

                    if (typeof prop === "string" && prop !== "id" && prop !== "_id")
                        this.addSetOperator(prop, value)

                    return true
                }
            })
            this.loadRecord(recordProxy)
            this.isNewRecord = !record
        }
        catch{
            logger.consoleLog(`Error loading document for Guild ${this.id}`)
            throw "Error loading data, please contact the host"
        }
    }

    public toRecord(): any { return this.record }
    public loadRecord(record: any): void { this.record = record }

    constructor(
        public id: string,
        dbClient?: IDbClient
    )
    {
        super()
        this.dbClient = dbClient || getDbClient()
    }
}