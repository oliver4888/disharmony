// tslint:disable: no-floating-promises
import { Expect, Setup, Test, TestFixture } from "alsatian"
import { IMock, It, Mock, Times } from "typemoq"
import { SubDocument } from ".."
import { DbClient } from "../database/db-client"
import Document from "./document"

class TestDocument extends Document
{
    public sub: TestSubDocument
}

class TestSubDocument extends SubDocument
{
    public get recordedString() { return this.record.recordedString }
    public set recordedString(value: string) { this.record.recordedString = value }

    public ephemeralString: string

    public toRecord() { return this.record }
    public loadRecord(record: any): void
    {
        this.record = record
        this.ephemeralString = "loadRecord"
    }
}

@TestFixture("SubDocment base class")
export class SubDocumentTestFixture
{
    public dbClient: IMock<DbClient>

    @Setup
    public setup()
    {
        this.dbClient = Mock.ofType<DbClient>()
        this.dbClient.setup(x => x.isReconnecting).returns(() => false)
    }

    @Test()
    public array_proxy_returns_class_instance_from_record_array_item()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        const parent = new TestDocument("id")

        // ACT
        const sut = SubDocument.getArrayProxy([{ recordedString: "record" }], parent, "sub", TestSubDocument)

        // ASSERT
        Expect(sut[0].recordedString).toBe("record")
        Expect(sut[0].ephemeralString).toBe("loadRecord")
    }

    @Test()
    public parent_document_updates_db_when_array_item_set()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        const parent = new TestDocument("id")

        // ACT
        const sut = SubDocument.getArrayProxy([{ recordedString: "record" }], parent, "sub", TestSubDocument)
        const newEntry = new TestSubDocument()
        newEntry.recordedString = "updatedRecord"
        sut[0] = newEntry
        parent.save()

        // ASSERT
        this.dbClient.verify(x => x.updateOne(It.isAnyString(), It.isAny(), { $set: { "sub.0": { recordedString: "updatedRecord" } } }), Times.once())
    }

    @Test()
    public same_instance_returned_when_repeat_access()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        const parent = new TestDocument("id")

        // ACT
        const sut = SubDocument.getArrayProxy([{ recordedString: "record" }], parent, "sub", TestSubDocument)
        sut[0].ephemeralString = "modified"

        // ASSERT
        Expect(sut[0].ephemeralString).toBe("modified")
    }

    @Test()
    public error_thrown_when_setting_index_and_parent_pending_field_write()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        const parent = new TestDocument("id")
        parent.updateFields = { sub: [] }

        // ACT
        const sut = SubDocument.getArrayProxy([{ recordedString: "record" }], parent, "sub", TestSubDocument)
        const newEntry = new TestSubDocument()
        newEntry.recordedString = "updatedRecord"

        // ASSERT
        Expect(() => sut[0] = newEntry).toThrow()
    }
}