import { IDbClient } from "../database/db-client";
import logger from "../utilities/logger";
import Serializable from "./serializable";

export default abstract class Document extends Serializable
{
    protected isNewRecord = false

    public updateFields: any = {}

    public static dbClient: IDbClient

    /** Save record modifications back to the database, or insert the record for the first time */
    public async save()
    {
        this.record._id = this.id

        if (this.isNewRecord)
            await Document.dbClient.insertOne(this.constructor.name, this.toRecord())
        else if (Object.keys(this.updateFields).length > 0)
            await Document.dbClient.updateOne(this.constructor.name, { _id: this.id }, { $set: this.updateFields })
        else
            await Document.dbClient.replaceOne(this.constructor.name, { _id: this.id }, this.toRecord())
        this.updateFields = {}
        this.isNewRecord = false
    }

    /** Delete the corresponding database record */
    public async deleteRecord()
    {
        await Document.dbClient.deleteOne(this.constructor.name, { _id: this.id })
    }

    /** Load the corresponding document from the database (basec off this document's .id) */
    public async loadDocument()
    {
        try
        {
            const record = await Document.dbClient.findOne(this.constructor.name, { _id: this.id })
            const recordProxy = new Proxy(record || {}, {
                get: (target, prop) => target[prop],
                set: (target, prop, value) =>
                {
                    target[prop] = value

                    if (typeof prop === "string" && prop !== "id" && prop !== "_id")
                        this.addSetOperator(prop, value)

                    return true
                },
            })

            this.isNewRecord = !record
            this.loadRecord(recordProxy)

            if (this.isNewRecord)
                await this.save()
        }
        catch (e)
        {
            logger.consoleLogError(`Error loading document for Guild ${this.id}`, e)
            throw new Error("Error loading data, please contact the host")
        }
    }

    /** Add a field to the $set operator used in the next update */
    public addSetOperator(field: string, value: any)
    {
        this.updateFields[field] = value
    }

    public toRecord(): any { return this.record }
    public loadRecord(record: any): void { this.record = record }

    constructor(
        public id: string,
    )
    {
        super()
    }
}