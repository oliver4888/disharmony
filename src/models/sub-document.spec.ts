import { AsyncTest, Expect, Setup, Test } from "alsatian"
import { IMock, It, Mock, Times } from "typemoq"
import { SubDocument } from "..";
import { IDbClient } from "../database/db-client";
import Document from "./document";

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

export default class SubDocumentTests
{
    public dbClient = Mock.ofType<IDbClient>()

    @Test()
    public array_proxy_returns_class_instance_from_record_array_item()
    {
        // ARRANGE
        const parent = new TestDocument("id", this.dbClient.object)

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
        const parent = new TestDocument("id", this.dbClient.object)

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
        const parent = new TestDocument("id", this.dbClient.object)

        // ACT
        const sut = SubDocument.getArrayProxy([{ recordedString: "record" }], parent, "sub", TestSubDocument)
        sut[0].ephemeralString = "modified"

        // ASSERT
        Expect(sut[0].ephemeralString).toBe("modified")
    }
}