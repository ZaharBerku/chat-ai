const getBase64 = (data: Blob | File, callback: any) => {
  const reader = new FileReader();
  reader.onload = function () {
    //@ts-ignore
    const base64data = reader?.result?.split(",")[1];
    callback(base64data, reader.result);
  };
  reader.readAsDataURL(data);
};

export { getBase64 };
