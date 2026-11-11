import { useEffect, useRef } from "react";
import { useProcessesActions } from "contexts/process";
import { useSessionLoaded, useWindowState } from "contexts/session";

const useCaseBoot = (): void => {
  const ready = useSessionLoaded();
  const booted = useRef(false);
  const { open } = useProcessesActions();
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
      initialRelativePosition: chatWindow.position ? undefined : { right: 544, top: 95 },
    });
  }, [ready, open, fileWindow.position, chatWindow.position]);
};
export default useCaseBoot;
