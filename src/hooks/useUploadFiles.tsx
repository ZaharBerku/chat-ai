import { ChangeEvent, useState } from "react";
import { FilesType, FileType, FilesArray } from "@/types/Model";
import { compressImage } from "@/utils/compressImage";

const useUploadFiles = () => {
  const [selectedFiles, setSelectedFiles] = useState<FilesType>({
    files: [],
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const deleteFiles = (id: number, type: "files" | "images") => {
    setSelectedFiles((currentFiles) => {
      const files = currentFiles[type].filter((file) => file.id !== id);
      return {
        ...currentFiles,
        [type]: files,
      };
    });
  };

  const resetFiles = () => {
    setSelectedFiles({
      files: [],
      images: [],
    });
  };

  const getCompressedFiles = async (files: FileList) => {
    const compressedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        // Check if the file size is greater than 4MB
        const isCheckExceededLimit = file.size > 4 * 1000 * 1000;
        return isCheckExceededLimit && file.type.includes("image")
          ? await compressImage(file)
          : file;
      })
    );
    return compressedFiles;
  };

  const getFilesDataArray = async (
    compressedFiles: File[]
  ): Promise<FilesArray[]> => {
    const imageDataArray: FilesArray[] = await Promise.all(
      compressedFiles.map((file, index) => {
        return file.type.includes("image")
          ? new Promise<FileType>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const data = {
                  url: reader.result as string,
                  id: Date.now() + index,
                  type: file.type,
                  name: file.name,
                };
                resolve(data);
              };
              reader.readAsDataURL(file);
            })
          : {
              file,
              id: Date.now() + index,
            };
      })
    );
    return imageDataArray;
  };

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const allFiles = event?.target?.files;

    if (allFiles && allFiles.length > 0) {
      setIsLoading(true);
      const compressedFiles = await getCompressedFiles(allFiles);
      const filesDataArray = await getFilesDataArray(compressedFiles);
      const { files, images } = filesDataArray.reduce(
        (item, file) => {
          const currentValue = item[file.file ? "files" : "images"];
          item[file.file ? "files" : "images"] =
            (currentValue.push(file), currentValue);
          return item;
        },
        {
          files: [],
          images: [],
        } as FilesType
      );
      setSelectedFiles((currentImages) => ({
        files: [...currentImages.files, ...files],
        images: [...currentImages.images, ...images],
      }));
      setIsLoading(false);
    }
  };

  return {
    selectedFiles,
    isLoading,
    handleFilesChange,
    deleteFiles,
    resetFiles,
    setSelectedFiles,
  };
};

export default useUploadFiles;
