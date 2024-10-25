import { compressImage } from "@/utils/compressImage";

const compressImagesAndGetBase64 = async (arrayImages: any) => {
  const result = await Promise.all(
    arrayImages.map(async (item: any) => {
      const binaryData = Buffer.from(item.b64_json, "base64");
      const blob = new Blob([binaryData], { type: "image/png" });
      const file = new File([blob], "name.png", { type: blob.type });
      return await compressImage(file);
    })
  );
  const imageDataArray = await Promise.all(
    result.map((file, index) => {
      return new Promise((resolve) => {
        // Use FileReader to read the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
          const data = {
            b64_json: reader.result as string,
            id: Date.now() + index,
          };
          resolve(data);
        };
        reader.readAsDataURL(file);
      });
    })
  );
  return imageDataArray;
};

export { compressImagesAndGetBase64 };
