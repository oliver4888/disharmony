import { existsSync, readFileSync } from "fs"

export default function (credentialsPath: string = "./credentials.json", fallbackTokenPath: string = "./token")
{
    let token: string, dbConnectionString: string = "nedb://nedb-data"
    if (existsSync(credentialsPath))
        [token, dbConnectionString] = require(credentialsPath)
    else if(existsSync(fallbackTokenPath))
        token = readFileSync(fallbackTokenPath, "utf8")
    else
        throw new Error("No token or credentials file found!")
    
    return {
        token,
        dbConnectionString,
        isLocalDb: dbConnectionString.startsWith("nedb://")
    }
}