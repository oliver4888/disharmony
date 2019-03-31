import Command, { PermissionLevel } from "../commands/command"

function invoke()
{
    return Promise.resolve(require(process.cwd() + "/package.json").version)
}

module.exports = new Command(
    /*name*/            "version",
    /*description*/     "Returns the current version of the bot",
    /*syntax*/          "version",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke
)