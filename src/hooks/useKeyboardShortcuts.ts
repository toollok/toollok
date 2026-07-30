"use client";

import { useEffect } from "react";

interface ShortcutConfig {
     key: string;
     ctrlOrCmd?: boolean;
     shift?: boolean;
     action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
     useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
               shortcuts.forEach(({ key, ctrlOrCmd, shift, action }) => {
                    const isCtrlCmd = ctrlOrCmd ? (event.ctrlKey || event.metaKey) : true;
                    const isShift = shift ? event.shiftKey : true;

                    if (isCtrlCmd && isShift && event.key.toLowerCase() === key.toLowerCase()) {
                         event.preventDefault();
                         action();
                    }
               });
          };

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
     }, [shortcuts]);
}