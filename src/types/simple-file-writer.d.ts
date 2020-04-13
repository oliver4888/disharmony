declare module "simple-file-writer"

declare class SimpleFileWriter {
    public write: (msg: string, cb?: () => void) => void
}