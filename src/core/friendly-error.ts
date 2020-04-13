export abstract class FriendlyError extends Error {
    public friendlyMessage: string
    constructor(
        message: string,
        friendlyMessage: string | boolean = false,
    ) {
        super(message)

        if (friendlyMessage === true)
            this.friendlyMessage = message
        else if (typeof friendlyMessage === "string")
            this.friendlyMessage = friendlyMessage

        // See https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, FriendlyError.prototype)
    }
}