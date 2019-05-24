import { FriendlyError } from "../core/friendly-error";

export class DocumentError extends FriendlyError
{
    private static getFriendlyMessage(reason: DocumentErrorReason)
    {
        switch (reason)
        {
            case DocumentErrorReason.DatabaseCommandThrew:
                return "Database command failed, if this error persists the host owner should check their console for errors."
            case DocumentErrorReason.DatabaseReconnecting:
                return "Database unexpectedly disconnected! Attempting reconnect, please try again shortly."
        }
    }

    constructor(
        public reason: DocumentErrorReason,
    )
    {
        super(DocumentError.getFriendlyMessage(reason), true);

        Object.setPrototypeOf(this, DocumentError.prototype);
    }
}

export enum DocumentErrorReason
{
    DatabaseCommandThrew,
    DatabaseReconnecting,
}