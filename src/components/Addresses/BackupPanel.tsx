import { useRef, useState } from "react";

interface Props {
  onExport: () => string;
  onImport: (json: string) => void;
}

export function BackupPanel({ onExport, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const json = onExport();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `we-all-follow-the-arsenal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      onImport(text);
      setMessage("Backup restored.");
    } catch {
      setMessage("That file couldn't be read as a backup.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <div className="section-title">Backup</div>
      <div className="bulk-actions">
        <button className="btn" onClick={handleExport}>
          Export backup
        </button>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {message && <div className="stat-detail">{message}</div>}
    </div>
  );
}
