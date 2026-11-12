import { useEffect, useRef } from "react";
import { useProcessesActions } from "contexts/process";
import { useSessionLoaded, useWindowState, useSessionActions } from "contexts/session";

const useCaseBoot = (): void => {
  const ready = useSessionLoaded();
  const booted = useRef(false);
  const { open } = useProcessesActions();
  const { setWallpaper } = useSessionActions();
  useEffect(() => {
    if (!ready) return;
    const sync = (): void => {
      let stage = 0;
      try { stage = JSON.parse(localStorage.getItem("no-outside.save.v1") || "{}").stage || 0; } catch { /* New save */ }
      setWallpaper(stage >= 9 ? "/System/Wallpapers/wallpaper-stage9.png" : "/System/Wallpapers/wallpaper.png", "fill");
    };
    const receive = (e: StorageEvent): void => { if (e.key === "no-outside.save.v1") sync(); };
    sync(); window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [ready, setWallpaper]);
  const fileWindow = useWindowState("FileExplorer__/Users/Public/Documents/HC_ARCHIVE");
  const chatWindow = useWindowState("CaseChat");
  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    // Open just two familiar desktop apps. The player chooses where to go next.
    open("FileExplorer", {
      url: "/Users/Public/Documents/HC_ARCHIVE",
      initialRelativePosition: fileWindow.position ? undefined : { left: 115, top: 75 },
    });
    open("CaseChat", {
      initialRelativePosition: chatWindow.position ? undefined : { right: 764, top: 95 },
    });
  }, [ready, open, fileWindow.position, chatWindow.position]);
};
export default useCaseBoot;
