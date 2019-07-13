import { SimpleEventDispatcher } from "strongly-typed-events"
import { NotifyPropertyChanged } from ".."
import Document from "./document"
import Serializable from "./serializable"

export default abstract class SubDocument extends Serializable implements NotifyPropertyChanged
{
    public onPropertyChanged = new SimpleEventDispatcher<string>()

    public static getArrayProxy<T extends SubDocument>(proxyTarget: any[], parent: Document, serializeName: string, ctor: new () => T): T[]
    {
        return new Proxy(proxyTarget, {
            get: (target: any, prop) =>
            {
                // if prop is array index, create T from data if not already created
                if (typeof prop === "string" && !isNaN(Number(prop)) && !(target[prop] instanceof SubDocument))
                {
                    const subDoc = new ctor()
                    subDoc.loadRecord(target[prop])
                    subDoc.onPropertyChanged.sub(() => this.tryAddSetOperator(parent, serializeName, prop, subDoc))
                    target[prop] = subDoc
                }
                return target[prop]
            },
            set: (target, prop, value) =>
            {
                target[prop] = value
                if (typeof prop === "string" && !isNaN(Number(prop)))
                    this.tryAddSetOperator(parent, serializeName, prop, (target[prop] as SubDocument))
                return true
            },
        })
    }

    private static tryAddSetOperator(parent: Document, arrayFieldName: string, idxStr: string, subDocument: SubDocument)
    {
        /* If the field has had a direct write to it, writing to an index will cause a conflict.
           The current pending updates should be flushed before modifying subdocuments by index. */
        if (parent.updateFields[arrayFieldName])
            throw new Error(`Can't modify subdocument of '${arrayFieldName}' when there is a pending write to the field itself`)

        parent.addSetOperator(`${arrayFieldName}.${idxStr}`, subDocument.toRecord())
    }
}