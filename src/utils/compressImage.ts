import imageCompression from "browser-image-compression";

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true,
  };
  const result = await imageCompression(file, options);

  return result;
};

export { compressImage };
