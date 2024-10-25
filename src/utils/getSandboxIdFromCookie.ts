export const getSandboxIdFromCookie = (cookieHeader: any, chatId: any) => {
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc: any, cookie: any) => {
      const [name, value] = cookie.trim().split("=");
      acc[name] = value;
      return acc;
    }, {});
    const sandboxId = cookies[`sandboxId_${chatId}`] || "";
    return sandboxId === "undefined" ? "" : sandboxId;
  }
};