import { FC } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { FileType } from "@/types/Model";

interface ImagesProps {
  images: FileType[];
  isLoading: boolean;
  deleteImage: (id: number) => void;
}

const Images: FC<ImagesProps> = ({ images, isLoading, deleteImage }) => {
  if (!images.length) {
    return null;
  }

  return (
    <div className="flex gap-3 mb-5 flex-wrap">
      {images.map((img) => {
        return (
          <div key={img.id} className="relative w-14 h-14">
            <button
              onClick={() => deleteImage(img.id)}
              className="rounded-full absolute -top-1 -right-1 bg-slate-500 w-4 h-4 flex justify-center items-center"
            >
              <IoMdClose />
            </button>
            {img.url && (
              <Image
                src={img.url}
                width="0"
                height="0"
                sizes="100vw"
                className="rounded-md max-w-auto max-h-auto w-full h-full object-cover"
                alt="image ai"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Images;
