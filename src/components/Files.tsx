import { FC, Fragment } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { FilesType, FileType } from "@/types/Model";
import { FaRegFile } from "react-icons/fa";
interface FilesProps {
  allFiles: FilesType;
  isLoading?: boolean;
  deleteImage?: (id: number, type: "images" | "files") => void;
}

interface FileProps {
  file: File;
  id: number;
  onClick?: any;
}

export const File: FC<FileProps> = ({ file, onClick, id }) => {
  const [_, typeFile] = file.type.split("/");
  const name = file.name;
  return (
    <div className="rounded-md relative w-full max-w-[100px] md:max-w-[150px] border border-gray-300 p-1 flex gap-1 md:gap-2 h-10 md:h-14">
      {onClick && (
        <button
          onClick={() => onClick(id, "files")}
          type="button"
          className="rounded-full absolute -top-1 -right-1 bg-slate-500 w-4 h-4 flex justify-center items-center"
        >
          <IoMdClose />
        </button>
      )}
      <div className="flex justify-center items-center bg">
        <FaRegFile className="text-xl md:text-3xl" />
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-ellipsis whitespace-nowrap max-w-full overflow-hidden w-[60px] md:w-[100px] text-sm text-white">
          {name}
        </span>
        <span className="text-ellipsis whitespace-nowrap max-w-full overflow-hidden w-[60px] md:w-[100px] text-[10px] md:text-xs text-gray-300">
          {typeFile?.toLocaleUpperCase() || "File"}
        </span>
      </div>
    </div>
  );
};

const Files: FC<FilesProps> = ({ allFiles, isLoading, deleteImage }) => {
  if (!allFiles?.files?.length && !allFiles?.images?.length) {
    return null;
  }
  const { files = [], images = [] } = allFiles;

  return (
    <div className="flex gap-1 md:gap-3 mb-5 flex-wrap">
      {[...images, ...files].map((file, index) => {
        return (
          <Fragment key={file.id || index}>
            {file?.type?.includes("image") ? (
              <div className="relative w-10 md:w-14 md:h-14">
                {deleteImage && (
                  <button
                    onClick={() => deleteImage(file.id, "images")}
                    type="button"
                    className="rounded-full absolute -top-1 -right-1 bg-slate-500 w-4 h-4 flex justify-center items-center"
                  >
                    <IoMdClose />
                  </button>
                )}
                {file.url && (
                  <Image
                    src={file.url}
                    width="0"
                    height="0"
                    sizes="100vw"
                    className="rounded-md max-w-auto max-h-auto w-full h-full object-cover"
                    alt="image ai"
                  />
                )}
              </div>
            ) : (
              <>
                {file.file ? (
                  <File file={file.file} id={file.id} onClick={deleteImage} />
                ) : (
                  <File file={file as any} id={file.id} />
                )}
              </>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default Files;
