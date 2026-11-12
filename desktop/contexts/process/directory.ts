import dynamic from "next/dynamic";
import { type Processes } from "contexts/process/types";
import { FOLDER_ICON, TASKBAR_HEIGHT } from "utils/constants";

const directory: Processes = {
  CaseChat: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:740,height:640},icon:"/System/Icons/echo.svg",title:"陆遥",backgroundColor:"#f7f8fa",singleton:true },
  CaseNotes: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:640,height:760},icon:"/System/Icons/margin.svg",title:"调查便签",backgroundColor:"#f7f8fa",singleton:true },
  CaseSearch: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:880,height:640},icon:"/System/Icons/compass.svg",title:"芦苇搜索",backgroundColor:"#f7f8fa",singleton:true },
  CaseReader: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:920,height:720},icon:"/System/Icons/photo.webp",title:"影像查看器",backgroundColor:"#f7f8fa",singleton:true },
  CaseSpace: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:1000,height:700},icon:"/System/Icons/executable.webp",title:"空间复核 · HC-19-041",backgroundColor:"#f7f8fa",singleton:true },
  FileExplorer: {
    backgroundColor: "#202020",
    Component: dynamic(() => import("components/apps/FileExplorer")),
    defaultSize: {
      height: 470,
      width: 390,
    },
    icon: FOLDER_ICON,
    title: "File Explorer",
  },
  OpenWith: {
    allowResizing: false,
    backgroundColor: "#FFF",
    Component: dynamic(() => import("components/system/Dialogs/OpenWith")),
    defaultSize: {
      height: 492,
      width: 392,
    },
    dialogProcess: true,
    hideTaskbarEntry: true,
    hideTitlebar: true,
    icon: "/System/Icons/unknown.webp",
    isLightBg: true,
    title: "Open With",
  },
  Properties: {
    allowResizing: false,
    backgroundColor: "rgb(240, 240, 240)",
    Component: dynamic(() => import("components/system/Dialogs/Properties")),
    defaultSize: {
      height: 412,
      width: 361,
    },
    dialogProcess: true,
    hideMaximizeButton: true,
    hideMinimizeButton: true,
    icon: "",
    isLightBg: true,
    title: "Properties",
  },
  Run: {
    allowResizing: false,
    Component: dynamic(() => import("components/system/Dialogs/Run")),
    defaultSize: {
      height: 174,
      width: 397,
    },
    dialogProcess: true,
    hideMaximizeButton: true,
    hideMinimizeButton: true,
    icon: "/System/Icons/run.webp",
    initialRelativePosition: {
      bottom: TASKBAR_HEIGHT + 11,
      left: 15,
    },
    isLightBg: true,
    singleton: true,
    title: "Run",
  },
  Transfer: {
    allowResizing: false,
    backgroundColor: "#FFF",
    Component: dynamic(() => import("components/system/Dialogs/Transfer")),
    defaultSize: {
      height: 163,
      width: 400,
    },
    dialogProcess: true,
    icon: "/System/Icons/copying.webp",
    isLightBg: true,
    title: "",
  },
};

export default directory;
