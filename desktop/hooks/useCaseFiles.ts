import { useEffect } from "react";
import { useFileSystemActions } from "contexts/fileSystem";
import { useSessionLoaded } from "contexts/session";
import receivedFiles from "public/case/received-files.json";

const useCaseFiles = (): void => {
  const ready = useSessionLoaded();
  const { exists, mkdirRecursive, writeFile, updateFolder } = useFileSystemActions();
  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    let queue = Promise.resolve();
    const sync = (): void => {
      queue = queue.then(async () => {
        let stage = 0;
        try { stage = JSON.parse(window.localStorage.getItem("no-outside.save.v1") || "{}").stage || 0; } catch { /* new save */ }
        for (const file of receivedFiles) {
          if (disposed || stage < file.stage) continue;
          const folder = "/Users/Public/Documents/HC_ARCHIVE/现场回传";
          const target = `${folder}/${file.name}`;
          if (await exists(target)) continue;
          await mkdirRecursive(folder);
          await writeFile(target, file.shortcut);
          await updateFolder(folder, file.name);
        }
      }).catch(() => undefined);
    };
    const storage = (event: StorageEvent): void => { if(event.key === "no-outside.save.v1") sync(); };
    sync();
    window.addEventListener("storage", storage);
    return () => { disposed = true; window.removeEventListener("storage", storage); };
  }, [ready, exists, mkdirRecursive, writeFile, updateFolder]);
};
export default useCaseFiles;
