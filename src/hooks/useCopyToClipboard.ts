"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard(resetInterval = 2000) {
     const [isCopied, setIsCopied] = useState(false);

     const copy = useCallback(async (text: string) => {
          if (!text) return false;

          try {
               await navigator.clipboard.writeText(text);
               setIsCopied(true);

               setTimeout(() => {
                    setIsCopied(false);
               }, resetInterval);

               return true;
          } catch (error) {
               console.error("Failed to copy text to clipboard", error);
               return false;
          }
     }, [resetInterval]);

     return { isCopied, copy };
}