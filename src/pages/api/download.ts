import fs from "fs";
import path from "path";
import {
  closeWithTimeout,
  getCodeInterpreter,
} from "@/utils/getCodeInterpreter";
import { getSandboxIdFromCookie } from "@/utils/getSandboxIdFromCookie";
import { env } from "../../config/env";
import * as dotenv from "dotenv";
dotenv.config();

export default async function handler(req: any, res: any) {
  const { Filename, filename: filename2, threadId } = req.query;

  try {
    const cookieHeader = req.headers.cookie;
    const sandboxId = getSandboxIdFromCookie(cookieHeader, threadId);

    const sandbox = await getCodeInterpreter(sandboxId, env, res);
    let filename = Filename || filename2;
    if (sandbox) {
      const decodeFilename = decodeURIComponent(filename);
      const isFullPath = decodeFilename.includes("/home/user/");
      const currentFileName = isFullPath
        ? decodeFilename.replace("/home/user/", "")
        : decodeFilename;
      const buffer: any = await sandbox.downloadFile(
        `home/user/${currentFileName}`,
        "buffer"
      );
      const filePath = path.resolve("./", `tmp/${currentFileName}`);
      fs.writeFileSync(`tmp/${currentFileName}`, buffer);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${currentFileName}`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on("close", async () => {
        fs.unlinkSync(filePath);
        await closeWithTimeout(sandbox);
      });

      // Handle stream errors (like file not found)
      fileStream.on("error", async (error) => {
        console.error("Stream error:", error);
        await closeWithTimeout(sandbox);
        res.status(500).end();
      });
    } else {
      // Handle case where sandbox doesn't exist
      await closeWithTimeout(sandbox);
      res.status(404).json({ error: "Sandbox not found", sandboxId });
    }
  } catch (err) {
    res.status(500).json({
      error: "An error occurred downloading file." + `${err}`,
    });
  }
}
