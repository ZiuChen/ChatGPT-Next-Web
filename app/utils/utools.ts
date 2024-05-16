import { ChatSession } from "../store";

export const isUTools = typeof window !== "undefined" && !!window.utools;

/**
 * Setup the feature for the chat session.
 */
export function setupGlobalAsk(session: ChatSession) {
  if (!isUTools) {
    return;
  }

  const code = "global-ask/" + session.id;
  return utools.setFeature({
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
}

export function clearGlobalAsk(sessionId: string) {
  if (isUTools) {
    return utools.removeFeature("global-ask/" + sessionId);
  }
}

export const storage = isUTools ? utools.dbStorage : globalThis?.localStorage;
