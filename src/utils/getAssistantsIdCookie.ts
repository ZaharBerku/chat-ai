export const getAssistantsIdCookie = (cookieHeader: any) => {
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc: any, cookie: any) => {
      const [name, value] = cookie.trim().split("=");
      acc[name] = value;
      return acc;
    }, {});
    const assistantsId = cookies["assistant-id"] || "";
    return assistantsId === "undefined" ? "" : assistantsId;
  }
};
