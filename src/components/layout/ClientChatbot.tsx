"use client";

import dynamic from "next/dynamic";

export const ClientChatbot = dynamic(
  () => import("./Chatbot").then((mod) => mod.Chatbot),
  { ssr: false }
);
