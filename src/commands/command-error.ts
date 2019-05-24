import { FriendlyError } from "../core/friendly-error";

export class CommandError extends FriendlyError
{
    private static getFriendlyMessage(reason: RejectionReason)
    {
        switch (reason)
        {
            case RejectionReason.UserMissingPermissions:
                return "You do not have permission to use this command"
            case RejectionReason.IncorrectSyntax:
                return "Incorrect syntax! See correct syntac with the `help` command"
            case RejectionReason.BotMissingGuildPermissions:
                return "The bot has not been granted the necessary permissions in this server. Please grant the permissions and try again. Details can be found in the readme you used to invite the bot."
        }
    }

    constructor(
        public reason: RejectionReason,
    )
    {
        super(CommandError.getFriendlyMessage(reason), true)

        Object.setPrototypeOf(this, CommandError.prototype)
    }
}

export enum RejectionReason
{
    UserMissingPermissions,
    BotMissingGuildPermissions,
    IncorrectSyntax,
}