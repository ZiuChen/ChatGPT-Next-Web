"use client";

require("../polyfill");

import { useState, useEffect, useCallback } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { ModelProvider, Path, SlotID, UNFINISHED_INPUT } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang, getLang } from "../locales";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { getClientConfig } from "../config/client";
import { type ClientApi, getClientApi } from "../client/api";
import { useAccessStore, useChatStore } from "../store";
import {
  UToolsEventMap,
  assetCast,
  isBrowserWindow,
  storage,
  useUToolsMessage,
} from "../utils/utools";
import { useUToolsStore } from "../store/utools";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Artifacts = dynamic(async () => (await import("./artifacts")).Artifacts, {
  loading: () => <Loading noLogo />,
});

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

const PluginPage = dynamic(async () => (await import("./plugin")).PluginPage, {
  loading: () => <Loading noLogo />,
});

const SearchChat = dynamic(
  async () => (await import("./search-chat")).SearchChatPage,
  {
    loading: () => <Loading noLogo />,
  },
);

const Sd = dynamic(async () => (await import("./sd")).Sd, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

export function WindowContent(props: { children: React.ReactNode }) {
  return (
    <div className={styles["window-content"]} id={SlotID.AppBody}>
      {props?.children}
    </div>
  );
}

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isArtifact = location.pathname.includes(Path.Artifacts);
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isSd = location.pathname === Path.Sd;
  const isSdNew = location.pathname === Path.SdNew;

  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  if (isArtifact) {
    return (
      <Routes>
        <Route path="/artifacts/:id" element={<Artifacts />} />
      </Routes>
    );
  }
  const renderContent = () => {
    if (isAuth) return <AuthPage />;
    if (isSd) return <Sd />;
    if (isSdNew) return <Sd />;
    return (
      <>
        <SideBar className={isHome ? styles["sidebar-show"] : ""} />
        <WindowContent>
          <Routes>
            <Route path={Path.Home} element={<Chat />} />
            <Route path={Path.NewChat} element={<NewChat />} />
            <Route path={Path.Masks} element={<MaskPage />} />
            <Route path={Path.Plugins} element={<PluginPage />} />
            <Route path={Path.SearchChat} element={<SearchChat />} />
            <Route path={Path.Chat} element={<Chat />} />
            <Route path={Path.Settings} element={<Settings />} />
          </Routes>
        </WindowContent>
      </>
    );
  };

  return (
    <div
      className={`${styles.container} ${
        shouldTightBorder ? styles["tight-container"] : styles.container
      } ${getLang() === "ar" ? styles["rtl-screen"] : ""}`}
      style={
        isBrowserWindow
          ? {
              // Offset of top bar
              paddingTop: "15px",
            }
          : {}
      }
    >
      {renderContent()}
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  const api: ClientApi = getClientApi(config.modelConfig.providerName);

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function Home() {
  const chatStore = useChatStore();
  const uToolsStore = useUToolsStore();

  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();
  }, []);

  const handler = useCallback((_: any, action: any) => {
    const id = action.code.split("/")[1];
    const sessions = chatStore.sessions;
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) {
      return;
    }

    // Update the action
    uToolsStore.updateAction(action);

    // select the session
    chatStore.selectSession(idx);
  }, []);

  useEffect(() => {
    if (isBrowserWindow) {
      window.preload.ipcRenderer.on("globalAsk", handler);

      return () => {
        window.preload.ipcRenderer.off("globalAsk", handler);
      };
    }
  }, []);

  useUToolsMessage((type, payload) => {
    const height = storage.getItem("utools-config/plugin-height");
    if (height !== null) {
      utools.setExpendHeight(height);
    }

    if (type === "onPluginEnter") {
      const action = assetCast<UToolsEventMap["onPluginEnter"]>(payload);

      if (action && action.code.startsWith("global-ask/")) {
        if (window.__UTOOLS_ASIDE__) {
          window.__UTOOLS_ASIDE__.webContents.send("globalAsk", action);
          return;
        }

        // Update the action
        uToolsStore.updateAction(action);

        const id = action.code.split("/")[1];
        const sessions = chatStore.sessions;
        const idx = sessions.findIndex((s) => s.id === id);
        if (idx === -1) {
          return;
        }

        // select the session
        chatStore.selectSession(idx);

        if (action.type === "text") {
          // TODO: Optional Quick ask
          utools.setExpendHeight(0);
          let result = "";
          utools.setSubInput(({ text }) => {
            result = text;
          }, "请输入内容，按下回车提问");

          document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              // Revert the height
              utools.setExpendHeight(
                // TODO: integrate this state into store
                storage.getItem("utools-config/plugin-height") || 550,
              );
              utools.removeSubInput();

              if (result) {
                uToolsStore.update((state) => (state.subInputText = result));
              }
            }
          });
        }
      }

      if (action && action.code === "Launch ChatGPT Next Aside") {
        if (window.__UTOOLS_ASIDE__ && !window.__UTOOLS_ASIDE__.isDestroyed()) {
          window.__UTOOLS_ASIDE__.show();
          return;
        }

        utools.outPlugin();
        utools.hideMainWindow();

        const isMacOS = utools.isMacOS();

        // Nearest Screen to the cursor
        const display = window.utools.getDisplayNearestPoint(
          window.utools.getCursorScreenPoint(),
        );

        // Bottom right corner
        const windowHeight = Math.round(0.7 * display.workArea.height);

        // Right side of the screen
        const windowX = Math.round(
          display.workArea.x + display.workArea.width - 420 - 20,
        );

        // Bottom of the screen
        const windowY = Math.round(
          display.workArea.y + display.workArea.height - windowHeight,
        );

        window.__UTOOLS_ASIDE__ = utools.createBrowserWindow(
          "index.html",
          {
            // @ts-expect-error - uTools TS typo
            show: false,
            title: "ChatGPT Next Aside",
            focusable: true, // for keyboard input
            fullscreenable: false,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            x: windowX,
            y: windowY,
            width: 420,
            height: windowHeight,
            type: isMacOS ? "panel" : "toolbar",
            titleBarStyle: "hidden",
            webPreferences: {
              preload: "preload.js",
            },
          },
          () => {
            window.__UTOOLS_ASIDE__.showInactive();
          },
        );

        window.__UTOOLS_ASIDE__.setAlwaysOnTop(
          true,
          isMacOS ? "modal-panel" : "pop-up-menu",
        );

        if (isMacOS) {
          window.__UTOOLS_ASIDE__.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true,
          });
        }
      }
    }
  });

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
