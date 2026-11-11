import { join } from "path";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
import { type FileDrop } from "components/system/Files/FileManager/useFileDrop";
import { type FileManagerViewNames } from "components/system/Files/Views";
import { useFileSystemActions } from "contexts/fileSystem";
import { UNKNOWN_SIZE } from "contexts/fileSystem/core";
import useResizeObserver from "hooks/useResizeObserver";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { getFormattedSize, haltEvent, label } from "utils/functions";

type StatusBarProps = {
  count: number;
  directory: string;
  fileDrop: FileDrop;
  selected: string[];
  setView: (view: FileManagerViewNames) => void;
  view: FileManagerViewNames;
};

const UNCALCULATED_SIZE = -2;

const StatusBar: FC<StatusBarProps> = ({
  count,
  directory,
  fileDrop,
  selected,
  setView,
  view,
}) => {
  const { exists, lstat, stat } = useFileSystemActions();
  const [selectedSize, setSelectedSize] = useState(UNKNOWN_SIZE);
  const [showSelected, setShowSelected] = useState(false);
  const { sizes } = useTheme();
  const updateShowSelected = (width: number): void =>
    setShowSelected(width > sizes.fileExplorer.minimumStatusBarWidth);
  const statusBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateSelectedSize = async (): Promise<void> => {
      const fileSizes = await Promise.all(
        selected.map(async (file) => {
          const path = join(directory, file);

          try {
            if (await exists(path)) {
              if ((await lstat(path)).isDirectory()) return UNCALCULATED_SIZE;

              return (await stat(path)).size;
            }
          } catch {
            // Ignore errors getting file sizes
          }

          return UNKNOWN_SIZE;
        })
      );

      if (fileSizes.includes(UNCALCULATED_SIZE)) {
        setSelectedSize(UNCALCULATED_SIZE);
        return;
      }

      const validSizes = fileSizes.filter((size) => size !== UNKNOWN_SIZE);

      setSelectedSize(
        validSizes.length === 0
          ? UNKNOWN_SIZE
          : validSizes.reduce((total, size) => total + size, 0)
      );
    };

    updateSelectedSize();
  }, [directory, exists, lstat, selected, stat]);

  useLayoutEffect(() => {
    if (statusBarRef.current) {
      updateShowSelected(statusBarRef.current.getBoundingClientRect().width);
    }
  }, [updateShowSelected]);

  useResizeObserver(statusBarRef, ([{ contentRect: { width = 0 } = {} }]) =>
    updateShowSelected(width)
  );

  return (
    <StyledStatusBar
      ref={statusBarRef}
      onContextMenuCapture={haltEvent}
      {...fileDrop}
    >
      <div role="group" {...label("项目总数")}>
        {count} 个项目
      </div>
      {showSelected && selected.length > 0 && (
        <div
          className="selected"
          role="group"
          {...label("已选项目数与大小")}
        >
          已选择 {selected.length} 个项目
          {selectedSize !== UNKNOWN_SIZE && selectedSize !== UNCALCULATED_SIZE
            ? `\u00A0\u00A0${getFormattedSize(selectedSize)}`
            : ""}
        </div>
      )}
      <nav className="views" role="presentation">
        <Button
          aria-pressed={view === "details"}
          className={view === "details" ? "active" : undefined}
          onClick={() => setView("details")}
          {...label(
            "显示窗口中每个项目的详细信息。(Ctrl+Shift+6)",
            "详细信息视图"
          )}
        >
          <Icon
            displaySize={16}
            imgSize={16}
            src="/System/Icons/details_view.webp"
          />
        </Button>
        <Button
          aria-pressed={view === "icon"}
          className={view === "icon" ? "active" : undefined}
          onClick={() => setView("icon")}
          {...label(
            "使用中型缩略图显示项目。(Ctrl+Shift+3)",
            "中等图标视图"
          )}
        >
          <Icon
            displaySize={16}
            imgSize={16}
            src="/System/Icons/icon_view.webp"
          />
        </Button>
      </nav>
    </StyledStatusBar>
  );
};

export default StatusBar;
