export const getImageTypeFromBase64 = (base64: string) => {
  const mimeType = base64.match(/data:(image\/[a-zA-Z]+);base64,/);
  if (mimeType) {
    return mimeType[1].split("/")[1];
  }
  return null;
};
