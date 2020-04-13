import { Logger } from ".."
import { DbClient } from "../database/db-client"
import { EventStrings } from "../utilities/logging/event-strings"
import { DocumentError, DocumentErrorReason } from "./document-error"
import Serializable from "./serializable"

export default abstract class Document extends Serializable {
    /** Whether this Document represents a brand new Database record */
    protected isNewRecord = false

    /** Name of the database collection to use when saving/loading this document */
    private dbCollectionName: string

    /** Collection of fields to be included in the next database $set operation */
    public updateFields: any = {}

    /** Reference to the IDbClient to use for Document save/load operations */
    public static dbClient: DbClient

    /** Save record modifications back to the database, or insert the record for the first time */
    public async save() {
        this.record._id = this.id

        /* Invoking toRecord here will execute any record writes that derived
           classes may implement in their toRecord function, in case they need
           to be included in the update $set operator */
        const record = this.toRecord()

        this.throwIfReconnecting()

        try {
            if (this.isNewRecord)
                await Document.dbClient.insertOne(this.dbCollectionName, record)
            else if (Object.keys(this.updateFields).length > 0)
                await Document.dbClient.updateOne(this.dbCollectionName, { _id: this.id }, { $set: this.updateFields })
            else
                await Document.dbClient.replaceOne(this.dbCollectionName, { _id: this.id }, record)
            this.updateFields = {}
            this.isNewRecord = false
        }
        catch (e) {
            await Logger.consoleLogError(`Error inserting or updating document for guild ${this.id}`, e)
            await Logger.logEvent(EventStrings.DocumentUpdateError, { id: this.id })
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    /** Delete the corresponding database record */
    public async deleteRecord() {
        this.throwIfReconnecting()
        try {
            await Document.dbClient.deleteOne(this.dbCollectionName, { _id: this.id })
        }
        catch (e) {
            await Logger.consoleLogError(`Error deleting record for guild ${this.id}`, e)
            await Logger.logEvent(EventStrings.DocumentDeleteError, { id: this.id })
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    /** Load the corresponding document from the database (based off this document's .id) */
    public async loadDocument() {
        this.throwIfReconnecting()
        try {
            const record = await Document.dbClient.findOne(this.dbCollectionName, { _id: this.id })
            const recordProxy = new Proxy(record || {}, {
                get: (target, prop) => target[prop],
                set: (target, prop, value) => {
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
        catch (e) {
            await Logger.consoleLogError(`Error loading document for guild ${this.id}`, e)
            await Logger.logEvent(EventStrings.DocumentLoadError, { id: this.id })
            throw new DocumentError(DocumentErrorReason.DatabaseCommandThrew)
        }
    }

    /** Throw an error if the database client is currently reconnecting */
    private throwIfReconnecting() {
        if (Document.dbClient.isReconnecting)
            throw new DocumentError(DocumentErrorReason.DatabaseReconnecting)
    }

    /** Add a field to the $set operator used in the next update */
    public addSetOperator(field: string, value: any) {
        this.updateFields[field] = value
    }

    public toRecord(): any { return this.record }
    public loadRecord(record: any): void { this.record = record }

    constructor(
        public id: string,
        dbCollectionName?: string,
    ) {
        super()
        this.dbCollectionName = dbCollectionName || this.constructor.name
    }
}