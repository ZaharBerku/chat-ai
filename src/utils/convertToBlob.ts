const convertToBlob = (base64String: string) => {
  const base64data = base64String?.split(",")[1];
  const binaryData = Buffer.from(base64data || base64String, "base64");
  const blob = new Blob([binaryData], { type: "image/png" });
  return URL.createObjectURL(blob);
};

export { convertToBlob };
