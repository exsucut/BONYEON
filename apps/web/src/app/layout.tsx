import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "본연 (BONYEON)",
  description: "다섯 체계로 비추는 본연. 사주·자미두수·48주·성향·내면 동기.",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="ko-KR">
      <body>{children}</body>
    </html>
  );
}
