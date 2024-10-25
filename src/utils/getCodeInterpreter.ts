import { CodeInterpreter } from "@e2b/code-interpreter";

const keepAliveTimeout = 10 * 60 * 1000;

// Until you close the sandbox it will be kept alive
export const getCodeInterpreter = async (
  codeInterpreterId: string,
  env: any,
  res?: any
) => {
  const action = codeInterpreterId ? "reconnect" : "create";
  try {
    const sandbox = codeInterpreterId
      ? await CodeInterpreter.reconnect({
          sandboxID: codeInterpreterId,
          apiKey: env.E2B_API_KEY,
        })
      : await CodeInterpreter.create({
          template: "sandbox-pga",
          apiKey: env.E2B_API_KEY,
        });
    return sandbox;
  } catch (error) {
    if (res) {
      res.status(404).json({ error, func: "getSandbox", action });
    }
    return null;
  }
};

// We use this method to close the sandbox but giving it a timeout during which we can reconnect to it and keep it alive.
export async function closeWithTimeout(sandbox: CodeInterpreter | null) {
  if (sandbox) {
    try {
      await sandbox?.keepAlive(keepAliveTimeout);
    } finally {
      await sandbox.close();
    }
  }
}
