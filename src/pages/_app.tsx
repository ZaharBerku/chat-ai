import { useEffect, useState } from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "@/config/env";
import CookieBanner from "@/components/CookieBanner";

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isProduction = process.env.NODE_ENV === "production";

  return (
    <>
      {isProduction && isClient && (
        <GoogleAnalytics gaId={env.GA_MEASUREMENT_ID || "G-ZDEBEFT4PR"} />
      )}
      <Component {...pageProps} />
      {isClient && <CookieBanner />}
    </>
  );
}
