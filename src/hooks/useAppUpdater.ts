import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { UpdateInfo } from "../components/modals/UpdateModal";
import { getEffectiveLocale } from "../i18n";

/**
 * 更新失败时的兜底提示（仅当后端未返回可读错误时使用）。
 */
function updateErrorMessage(kind: "download" | "restart"): string {
  const locale = getEffectiveLocale();
  if (locale === "zh") {
    return kind === "download" ? "更新下载失败" : "重启播放器失败";
  }
  if (locale === "en") {
    return kind === "download" ? "Failed to download update" : "Failed to restart player";
  }
  return kind === "download" ? "Ошибка загрузки обновления" : "Не удалось перезапустить плеер";
}

export type AppUpdatePhase =
  | "idle"
  | "downloading"
  | "ready"
  | "restarting"
  | "error";

export interface UpdateProgressPayload {
  downloaded: number;
  total: number;
  percentage: number;
}

export interface AppUpdaterController {
  phase: AppUpdatePhase;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  stagedVersion: string | null;
  targetRelease: UpdateInfo | null;
  errorMessage: string | null;
  startBackgroundUpdate: (release: UpdateInfo) => Promise<void>;
  restartToApply: () => Promise<void>;
  clearError: () => void;
}

/**
 * Централизованный контроллер фонового обновления приложения.
 * Позволяет скачивать и проверять обновление без прерывания просмотра видео.
 */
export function useAppUpdater(): AppUpdaterController {
  const [phase, setPhase] = useState<AppUpdatePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [stagedVersion, setStagedVersion] = useState<string | null>(null);
  const [targetRelease, setTargetRelease] = useState<UpdateInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    invoke<string | null>("get_staged_update_version")
      .then((ver) => {
        if (!disposed && !inFlightRef.current && ver) {
          setStagedVersion(ver);
          setProgress(100);
          setPhase("ready");
        }
      })
      .catch(() => {});

    const unlistenProgress = listen<UpdateProgressPayload>(
      "update-download-progress",
      (event) => {
        if (disposed) return;
        setProgress(Math.min(100, Math.max(0, event.payload.percentage)));
        setDownloadedBytes(event.payload.downloaded);
        setTotalBytes(event.payload.total);
      }
    );

    const unlistenReady = listen<string>("update-staged-ready", (event) => {
      if (disposed) return;
      setStagedVersion(event.payload);
      setProgress(100);
      setPhase("ready");
    });

    return () => {
      disposed = true;
      unlistenProgress.then((u) => u && u()).catch(() => {});
      unlistenReady.then((u) => u && u()).catch(() => {});
    };
  }, []);

  const startBackgroundUpdate = useCallback(async (release: UpdateInfo) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setTargetRelease(release);
    setErrorMessage(null);
    setProgress(0);
    setDownloadedBytes(0);
    setTotalBytes(0);
    setPhase("downloading");

    try {
      const ver = await invoke<string>("download_and_stage_update", {
        tag: release.latest_version,
      });
      setStagedVersion(ver);
      setProgress(100);
      setPhase("ready");
    } catch (err: unknown) {
      const msg =
        typeof err === "string"
          ? (/[\u0400-\u04FF]/.test(err) ? updateErrorMessage("download") : err)
          : err instanceof Error
          ? (/[\u0400-\u04FF]/.test(err.message) ? updateErrorMessage("download") : err.message)
          : updateErrorMessage("download");
      console.error("Ошибка фонового обновления L-MPV:", err);
      setErrorMessage(msg);
      setPhase("error");
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const restartToApply = useCallback(async () => {
    setPhase("restarting");
    try {
      await invoke("restart_and_apply_update");
    } catch (err: unknown) {
      const msg =
        typeof err === "string"
          ? (/[\u0400-\u04FF]/.test(err) ? updateErrorMessage("restart") : err)
          : err instanceof Error
          ? (/[\u0400-\u04FF]/.test(err.message) ? updateErrorMessage("restart") : err.message)
          : updateErrorMessage("restart");
      console.error("Ошибка перезапуска для обновления L-MPV:", err);
      setErrorMessage(msg);
      setPhase("error");
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setPhase((prev) => (prev === "error" ? "idle" : prev));
  }, []);

  return {
    phase,
    progress,
    downloadedBytes,
    totalBytes,
    stagedVersion,
    targetRelease,
    errorMessage,
    startBackgroundUpdate,
    restartToApply,
    clearError,
  };
}
