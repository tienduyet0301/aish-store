import { Metadata } from "next";
import CareInstructionsClient from "./CareInstructionsClient";

export const metadata: Metadata = {
  title: "Care Instructions | AISH",
};

export default function CareInstructions() {
  return <CareInstructionsClient />;
} 