import { IDbClient } from "../database/db-client";
import logger from "../utilities/logger";
import { DocumentError, DocumentErrorReason } from "./document-error";
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

        /* Invoking toRecord here will execute any record writes that derived
           classes may implement in their toRecord function, in case they need
           to be included in the update $set operator */
        const record = this.toRecord()

        this.throwIfReconnecting()

        try
        {
            if (this.isNewRecord)
                await Document.dbClient.insertOne(this.constructor.name, record)
            else if (Object.keys(this.updateFields).length > 0)
                await Document.dbClient.updateOne(this.constructor.name, { _id: this.id }, { $set: this.updateFields })
            else
                await Document.dbClient.replaceOne(this.constructor.name, { _id: this.id }, record)
            this.updateFields = {}
            this.isNewRecord = false
        }
        catch (e)
        {
            logger.consoleLogError(`Error inserting or updating document for guild ${this.id}`, e)
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    /** Delete the corresponding database record */
    public async deleteRecord()
    {
        this.throwIfReconnecting()
        try
        {
            await Document.dbClient.deleteOne(this.constructor.name, { _id: this.id })
        }
        catch (e)
        {
            logger.consoleLogError(`Error deleting record for guild ${this.id}`, e)
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    /** Load the corresponding document from the database (based off this document's .id) */
    public async loadDocument()
    {
        this.throwIfReconnecting()
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
            logger.consoleLogError(`Error loading document for guild ${this.id}`, e)
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    private throwIfReconnecting()
    {
        if (Document.dbClient.isReconnecting)
            throw new DocumentError(DocumentErrorReason.DatabaseReconnecting)
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