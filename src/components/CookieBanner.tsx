"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useEffect } from "react";

const CookieBanner = () => {
  const [cookieConsent, setLocalStorage] = useLocalStorage<boolean | null>(
    "cookie_consent",
    null
  );

  useEffect(() => {
    setLocalStorage(cookieConsent);
  }, [cookieConsent]);
  return (
    <div
      className={`${
        cookieConsent != null ? "hidden" : "flex"
      } my-10 z-[200] mx-auto max-w-max md:max-w-screen-sm
                        fixed bottom-0 left-0 right-0 
                        apx-3 md:px-4 py-3 justify-between items-center flex-col sm:flex-row gap-4  
                         bg-gray-700 rounded-lg shadow`}
    >
      <div className="text-center">
        <p>
          We use <span className="font-bold text-sky-400">cookies</span> on our
          site.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setLocalStorage(false)}
          className="px-5 py-2 text-gray-300 rounded-md border-gray-900"
        >
          Decline
        </button>
        <button
          onClick={() => {
            setLocalStorage(true);
          }}
          className="bg-gray-900 px-5 py-2 text-white rounded-lg"
        >
          Allow Cookies
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
