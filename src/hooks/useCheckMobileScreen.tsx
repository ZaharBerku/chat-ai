import React, { useEffect, useState } from "react";

const useCheckMobileScreen = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window?.innerWidth : 1200
  );
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowSizeChange);
    }
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return width <= 768;
};

export default useCheckMobileScreen;
