"use client";

import { SessionProvider } from "next-auth/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Care Instructions | AISH",
};

export default function CareInstructionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
} 