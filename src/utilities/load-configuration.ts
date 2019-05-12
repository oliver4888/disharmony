import { existsSync } from "fs"
import { resolve } from "path"
import Config from "../models/internal/config";

export default function (configPath: string = "./config.json"): { config: Config, isLocalDb: boolean }
{
    let config
    if (existsSync(configPath))
        config = require(resolve(process.cwd(), configPath))
    else
        throw new Error("No config file found!")

    if (!isConfigValid(config))
        throw new Error("Invalid config!")

    return {
        config,
        isLocalDb: config.dbConnectionString.startsWith("nedb://"),
    }
}

function isConfigValid(config: Config)
{
    // Todo: use a JSON schema for the below
    // Ensure the user hasn't typed non-strings into these json fields
    return config.dbConnectionString && typeof config.dbConnectionString === "string"
        && config.token && typeof config.token === "string"
        && config.serviceName && typeof config.serviceName === "string"
        && config.requiredPermissions && typeof config.requiredPermissions === "number"
}