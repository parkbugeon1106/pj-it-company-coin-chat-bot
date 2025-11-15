import "@/globals.css"; // 프로젝트 루트에 있는 CSS
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
