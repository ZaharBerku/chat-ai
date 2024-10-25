import { FC, useEffect, useState } from "react";
import { MdStorage } from "react-icons/md";
import { WarningEndOfMemory } from "./WarningEndOfMemory";
type StoragePercentageProps = {
  isMobile?: boolean;
};

const StoragePercentage: FC<StoragePercentageProps> = ({ isMobile }) => {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState<number>(0.0);
  const [isVisible, setIsVisible] = useState(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const updateUsedStorage = () => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          const usedBytes: any = estimate.usage;
          const quotaBytes: any = estimate.quota;
          const result = +((usedBytes / quotaBytes) * 100).toFixed(2);
          if (90 > result) {
            handleOpen();
          }
          setUsed(result);
        })
        .catch((error) => {
          console.error("Error estimating storage:", error);
        });
    } else {
      setIsVisible(false);
      console.log("Storage estimation is not supported in this browser.");
    }
  };
  useEffect(() => {
    let idInterval:any = null;
    if (isMobile) {
      updateUsedStorage();
    } else {
      idInterval = setInterval(() => {
        updateUsedStorage();
      }, 3000);
    }
    return () => {
      if (idInterval) {
        clearInterval(idInterval);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={"flex justify-between items-center py-2 pl-3 text-white"}>
        <div className={"flex gap-3 text-xs items-center"}>
          <MdStorage size={20} />
          Used Memory
        </div>
        {used}%
      </div>
      {open && <WarningEndOfMemory handleCloseModal={handleClose} />}
    </>
  );
};

export { StoragePercentage };
