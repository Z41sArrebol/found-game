import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";
import useCaseBoot from "hooks/useCaseBoot";
import useCaseFiles from "hooks/useCaseFiles";
import { keepCanvasesReadable } from "utils/readableCanvas";

// Before any app creates a canvas context
if (typeof window !== "undefined") keepCanvasesReadable(window);

const Index: FC = () => {
  useIFrameFocuser();
  useUrlLoader();
  useCaseBoot();
  useCaseFiles();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default Index;
