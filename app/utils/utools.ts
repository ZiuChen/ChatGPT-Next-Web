import { useCallback, useEffect } from "react";
import { ChatSession } from "../store";

export const isUTools = typeof window !== "undefined" && !!window.utools;

/**
 * Setup the feature for the chat session.
 */
export function setupGlobalAsk(session: ChatSession) {
  if (!isUTools) {
    return session;
  }

  const code = "global-ask/" + session.id;
  utools.setFeature({
    code,
    explain: `向 ${session.topic} 提问`,
    platform: ["darwin", "win32", "linux"],
    cmds: [
      session.topic,
      {
        type: "over",
        label: `向 ${session.topic} 提问`,
      },
    ],
  });

  return session;
}

export function clearGlobalAsk(session: ChatSession) {
  if (isUTools) {
    utools.removeFeature("global-ask/" + session.id);
    delete session?.globalAsk;
    return session;
  }

  return session;
}

export const storage = isUTools ? utools.dbStorage : globalThis?.localStorage;

export interface UToolsEventMap {
  onPluginEnter: { code: string; type: string; payload: any; option: any };
  onPluginDetach: void;
}

export function useUToolsMessage<Type extends keyof UToolsEventMap>(
  handler: (type: Type, payload: UToolsEventMap[Type]) => void,
) {
  const _handler = useCallback(
    (e: MessageEvent) => {
      const { type, payload } = e.data;
      if (typeof type !== "string" || !type.startsWith("utools:")) {
        return;
      }
      handler(type.split(":")[1] as Type, payload);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!isUTools) {
      return;
    }
    window.addEventListener("message", _handler);
    return () => {
      window.removeEventListener("message", _handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function assetCast<T>(value: unknown): T {
  return value as T;
}
