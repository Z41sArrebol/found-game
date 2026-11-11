import { useEffect, useRef } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getProcess, getProcesses, useProcess, useProcessesActions } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { IFRAME_CONFIG } from "utils/constants";

const PANES: Record<string, string> = {
  CaseChat: "chat",
  CaseNotes: "notes",
  CaseSearch: "browser",
  CaseReader: "reader",
  CaseSpace: "space",
};
const APPS: Record<string, string> = {
  chat: "CaseChat",
  notes: "CaseNotes",
  browser: "CaseSearch",
  reader: "CaseReader",
  space: "CaseSpace",
};

// The iframe contains application content only. Window chrome, resize, focus,
// animation, taskbar preview and persistence are provided by daedalOS itself.
const CaseApp: FC<ComponentProcessProps> = ({ id }) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const { url = "" } = useProcess(id);
  const { open, title, linkElement, minimize, url: setUrl } = useProcessesActions();
  const { setForegroundId } = useSessionActions();
  const processName = id.split("__")[0];
  const pane = PANES[processName] || "notes";
  const src = `/case/pane.html?pane=${pane}&doc=${encodeURIComponent(url || "room")}`;

  useEffect(() => {
    const receive = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      const data = event.data as {type?: string; app?: string; doc?: string; title?: string};
      if (data?.type === "no-outside:open") {
        if (data.app === "files") {
          open("FileExplorer", { url: "/Users/Public/Documents/HC_ARCHIVE" });
        } else if (data.app && APPS[data.app]) {
          const app = APPS[data.app];
          const activeId = Object.keys(getProcesses()).find(pid => pid === app || pid.startsWith(`${app}__`));
          if (activeId) {
            if (data.app === "reader") setUrl(activeId, data.doc || "room");
            if (getProcess(activeId)?.minimized) minimize(activeId);
            setForegroundId(activeId);
          } else {
            open(app, data.app === "reader" ? { url: data.doc || "room" } : undefined);
          }
        }
      } else if (data?.type === "no-outside:title" && typeof data.title === "string") {
        title(id, data.title);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [id, open, title, minimize, setUrl, setForegroundId]);

  return (
    <div style={{width:"100%",overflow:"hidden"}}>
    <iframe
      ref={iframe}
      src={src}
      title={pane === "reader" ? "调查档案" : ({chat:"陆遥的聊天",notes:"调查便签",browser:"芦苇搜索",space:"空间复核"}[pane] || "调查应用")}
      style={{ display:"block", width:"100%", height:"100%", border:0, background:"#f7f8fa" }}
      onLoad={() => { if (iframe.current) linkElement(id, "peekElement", iframe.current); }}
      {...IFRAME_CONFIG}
    />
    </div>
  );
};
export default CaseApp;
