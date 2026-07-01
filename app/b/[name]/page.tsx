'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AdUnit from '@/components/AdUnit';
import { db } from '@/lib/firebase';
import { slugifyBoardName } from '@/lib/board';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

async function deleteR2Files(storagePaths: string[]): Promise<void> {
  if (!storagePaths.length) return;
  try {
    await fetch('/api/board-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storagePaths }),
    });
  } catch {}
}

type ExpiryValue = '1h' | '24h';

interface FileSlot {
  id: string;
  name: string;
  ext: string;
  size: string;
  url: string;
  storagePath: string;
  expiresAt: number | null;
}

function extFromName(name: string): string {
  const e = name.split('.').pop()?.toLowerCase() ?? '';
  const MAP: Record<string, string> = {
    pdf: 'PDF', xlsx: 'XLS', xls: 'XLS', csv: 'CSV',
    doc: 'DOC', docx: 'DOC', json: 'JSON', zip: 'ZIP',
    jpg: 'JPG', jpeg: 'JPG', png: 'PNG', gif: 'GIF', webp: 'IMG',
    txt: 'TXT', mp4: 'MP4', mp3: 'MP3',
  };
  return MAP[e] ?? (e.toUpperCase().slice(0, 4) || 'FILE');
}

function expiryLabel(expiresAt: number | null): string {
  if (!expiresAt) return 'never';
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function expiryMs(val: ExpiryValue): number {
  const map: Record<ExpiryValue, number> = {
    '1h': 3600000, '24h': 86400000,
  };
  return map[val];
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const rawName = (params?.name as string) || '';
  const boardName = slugifyBoardName(rawName);

  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileSlot[]>([]);
  const [expiry, setExpiry] = useState<ExpiryValue>('24h');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [synced, setSynced] = useState(true);
  const [connected, setConnected] = useState(false);

  const [boardPin, setBoardPin] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pinDialog, setPinDialog] = useState<null | 'set' | 'unlock'>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const isEditable = !boardPin || unlocked;

  const textDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastPushed = useRef('');

  const boardRef = boardName ? doc(db, 'boards', boardName) : null;

  // Normalize the URL to the canonical slug (e.g. /b/My-Board -> /b/my-board).
  useEffect(() => {
    if (boardName && rawName && boardName !== rawName) {
      router.replace(`/b/${boardName}`);
    }
  }, [boardName, rawName, router]);

  useEffect(() => {
    if (!boardName) return;
    const stored = typeof window !== 'undefined' && sessionStorage.getItem(`unlock_${boardName}`);
    if (stored === '1') setUnlocked(true);
  }, [boardName]);

  const purgeFile = useCallback(async (slot: FileSlot, currentFiles: FileSlot[]) => {
    if (!boardRef) return;
    const updated = currentFiles.filter((f) => f.id !== slot.id);
    await deleteR2Files([slot.storagePath]);
    await updateDoc(boardRef, { files: updated }).catch(() => {});
  }, [boardName]);

  useEffect(() => {
    if (!boardRef) return;
    setConnected(false);
    const timeout = setTimeout(() => setConnected(false), 8000);
    const unsub = onSnapshot(
      boardRef,
      (snap) => {
        const incoming = snap.exists() ? (snap.data().text ?? '') : '';
        if (incoming !== lastPushed.current) setText(incoming);

        const pin: string | null = snap.exists() ? (snap.data().pin ?? null) : null;
        setBoardPin(pin);

        const now = Date.now();
        const all: FileSlot[] = snap.exists() ? (snap.data().files ?? []) : [];
        const live = all.filter((f) => !f.expiresAt || f.expiresAt > now);
        setFiles(live);
        setSynced(true);
        setConnected(true);
        clearTimeout(timeout);

        live.forEach((f) => {
          if (!f.expiresAt) return;
          const delay = f.expiresAt - Date.now();
          if (delay <= 0) return;
          if (expiryTimers.current[f.id]) clearTimeout(expiryTimers.current[f.id]);
          expiryTimers.current[f.id] = setTimeout(() => {
            setFiles((prev) => {
              purgeFile(f, prev);
              return prev.filter((x) => x.id !== f.id);
            });
          }, delay);
        });
      },
      (err) => { console.error('Board sync error:', err); setConnected(false); setSynced(false); clearTimeout(timeout); }
    );

    return () => {
      unsub();
      clearTimeout(timeout);
      Object.values(expiryTimers.current).forEach(clearTimeout);
    };
  }, [boardName]);

  const pushText = useCallback((val: string) => {
    if (!boardRef) return;
    lastPushed.current = val;
    setSynced(false);
    if (textDebounce.current) clearTimeout(textDebounce.current);
    textDebounce.current = setTimeout(async () => {
      try {
        await setDoc(boardRef, { text: val }, { merge: true });
        setSynced(true);
      } catch (err) {
        console.error('Push text error:', err);
        setSynced(false);
      }
    }, 500);
  }, [boardName]);

  const handleTextChange = (val: string) => {
    if (!isEditable) return;
    setText(val);
    pushText(val);
  };

  const handleSetPin = async () => {
    if (!boardRef) return;
    if (pinInput.length < 4) { setPinError('Enter at least 4 digits'); return; }
    if (pinInput !== pinConfirm) { setPinError('PINs do not match'); return; }
    try {
      await setDoc(boardRef, { pin: pinInput }, { merge: true });
      sessionStorage.setItem(`unlock_${boardName}`, '1');
      setUnlocked(true);
      setPinDialog(null);
      setPinInput('');
      setPinConfirm('');
      setPinError('');
    } catch (err) {
      console.error('Set PIN error:', err);
    }
  };

  const handleUnlock = () => {
    if (pinInput === boardPin) {
      sessionStorage.setItem(`unlock_${boardName}`, '1');
      setUnlocked(true);
      setPinDialog(null);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleRemovePin = async () => {
    if (!boardRef) return;
    try {
      await setDoc(boardRef, { pin: null }, { merge: true });
      sessionStorage.removeItem(`unlock_${boardName}`);
      setUnlocked(false);
      setBoardPin(null);
      setPinDialog(null);
    } catch (err) {
      console.error('Remove PIN error:', err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable || !boardRef) return;
    const f = e.target.files?.[0];
    if (!f || files.length >= 3) return;
    e.target.value = '';
    if (f.size > MAX_FILE_SIZE) return;

    const ms = expiryMs(expiry);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const contentType = f.type || 'application/octet-stream';

    setUploading((prev) => ({ ...prev, [id]: 0 }));

    try {
      const presignRes = await fetch('/api/board-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardName, fileName: f.name, contentType }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, storagePath, publicUrl } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          setUploading((prev) => ({ ...prev, [id]: Math.round((evt.loaded / evt.total) * 100) }));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.send(f);
      });

      const finalized: FileSlot = {
        id, name: f.name, ext: extFromName(f.name),
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        url: publicUrl, storagePath,
        expiresAt: Date.now() + ms,
      };

      setUploading((prev) => { const n = { ...prev }; delete n[id]; return n; });
      const updatedFiles = [...files, finalized];
      const nextCleanupAt = updatedFiles
        .filter((f) => f.expiresAt)
        .reduce((min, f) => Math.min(min, f.expiresAt!), Infinity);
      await updateDoc(boardRef, {
        files: updatedFiles,
        nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null,
      }).catch(() => setDoc(boardRef, { text, files: updatedFiles, nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null }));
    } catch (err) {
      console.error('Upload error:', err);
      setUploading((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const removeFile = async (slot: FileSlot) => {
    if (!isEditable || !boardRef) return;
    const updated = files.filter((f) => f.id !== slot.id);
    setFiles(updated);
    await deleteR2Files([slot.storagePath]);
    const nextCleanupAt = updated.filter((f) => f.expiresAt)
      .reduce((min, f) => Math.min(min, f.expiresAt!), Infinity);
    await updateDoc(boardRef, {
      files: updated,
      nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null,
    });
  };

  const clearAll = async () => {
    if (!isEditable || !boardRef) return;
    await deleteR2Files(files.map((f) => f.storagePath));
    setText('');
    setFiles([]);
    await setDoc(boardRef, { text: '', files: [], nextCleanupAt: null });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://clipvault-tools.vercel.app/b/${boardName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openPinDialog = () => {
    setPinInput('');
    setPinConfirm('');
    setPinError('');
    if (!boardPin) {
      setPinDialog('set');
    } else if (!unlocked) {
      setPinDialog('unlock');
    } else {
      handleRemovePin();
    }
  };

  const displaySlots = [
    ...files.slice(0, 3),
    ...Array(Math.max(0, 3 - files.length)).fill(null),
  ] as (FileSlot | null)[];

  if (!boardName) {
    return (
      <div className="min-h-screen flex flex-col bg-bg text-t1">
        <Nav />
        <main className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="font-mono text-[12px] text-t3 mb-3 break-all">/b/{rawName}</div>
          <h1 className="font-display text-[22px] mb-2">That board name is not valid</h1>
          <p className="text-[13px] text-t2 max-w-[320px] mb-6 leading-relaxed">
            Board names use 3 to 40 letters, numbers or hyphens. Pick a different name to continue.
          </p>
          <a
            href="/"
            className="rounded-[8px] bg-ac px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#EA8C15] transition-colors"
          >
            Back to home
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-t1">
      <Nav />

      <header className="px-5 sm:px-7 py-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[22px] font-semibold tracking-[-0.01em] mb-2">
              {boardName}
            </div>
            <div className="flex items-center gap-2 mb-[6px] flex-wrap">
              <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-[5px] border ${
                connected
                  ? 'bg-ok/[0.06] text-ok border-ok/[0.15]'
                  : 'bg-s3 text-t3 border-white/[0.06]'
              }`}>
                <div className={`w-[5px] h-[5px] rounded-full ${connected ? 'bg-ok animate-pulse' : 'bg-t3'}`} />
                {connected ? 'Live' : 'Connecting...'}
              </div>
              <div className="bg-s2 text-t3 border border-white/[0.06] text-[10px] px-2 py-[3px] rounded-[5px] font-medium">
                Free board
              </div>
              {boardPin && (
                <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-[5px] border ${
                  unlocked
                    ? 'bg-ok/[0.06] text-ok border-ok/[0.15]'
                    : 'bg-danger/[0.06] text-danger border-danger/[0.15]'
                }`}>
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" aria-hidden="true">
                    <rect x="0.6" y="3.5" width="6.8" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" fill="none"/>
                    {unlocked
                      ? <path d="M2 3.5V2.6A2 2 0 016 2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                      : <path d="M2 3.5V2.2A2 2 0 016 2.2v1.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    }
                  </svg>
                  {unlocked ? 'Protected' : 'Locked'}
                </div>
              )}
            </div>
            <div className="text-[10px] text-t3 font-mono">
              clipvault-tools.vercel.app/b/<span className="text-t2">{boardName}</span>
            </div>
          </div>

          <div className="flex gap-[6px] flex-wrap justify-end">
            <button
              onClick={copyLink}
              className="px-[11px] py-[6px] bg-s2 border border-white/10 rounded-[7px] text-t2 text-[11px] font-medium hover:border-[var(--ac-glow)] transition-all"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              onClick={openPinDialog}
              className={`px-[11px] py-[6px] bg-s2 border rounded-[7px] text-[11px] font-medium transition-all ${
                boardPin && !unlocked
                  ? 'border-danger/20 text-danger hover:border-danger/40'
                  : 'border-white/10 text-t2 hover:border-[var(--ac-glow)]'
              }`}
            >
              {!boardPin ? 'Protect' : unlocked ? 'Remove PIN' : 'Unlock'}
            </button>
            <button
              onClick={clearAll}
              disabled={!isEditable}
              className="px-[11px] py-[6px] bg-s2 border border-danger/20 rounded-[7px] text-danger text-[11px] font-medium hover:border-danger/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-7 py-[22px]">
        {/* Text slot */}
        <section aria-label="Shared text" className="mb-8">
          <div className="text-[10px] font-semibold text-t3 tracking-[0.08em] mb-[10px]">
            Text - live sync, never expires
          </div>
          <div className={`bg-s1 border rounded-xl overflow-hidden ${!isEditable ? 'border-danger/20' : 'border-white/[0.06]'}`}>
            <div className="relative px-5 py-4">
              <div className="flex items-center gap-1 text-[10px] text-ok absolute top-4 right-4">
                <div className={`w-[4px] h-[4px] rounded-full bg-ok ${synced ? '' : 'opacity-40'}`} />
                {synced ? 'synced' : 'syncing...'}
              </div>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value.slice(0, 65000))}
                readOnly={!isEditable}
                placeholder={isEditable ? 'Start typing - changes sync to all connected devices instantly' : 'Board is locked. Click Unlock to edit.'}
                aria-label="Shared board text"
                maxLength={65000}
                className={`w-full bg-transparent outline-none resize-y text-t1 text-[13px] leading-relaxed pr-20 min-h-[180px] max-h-[70vh] overflow-y-auto ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-[10px] border-t border-white/[0.06]">
              <span className={`text-[11px] font-mono ${text.length >= 65000 ? 'text-danger' : text.length > 60000 ? 'text-warn' : 'text-t3'}`}>
                {text.length.toLocaleString()} / 65,000
              </span>
              <button
                onClick={() => { if (isEditable) { setText(''); pushText(''); } }}
                disabled={!isEditable}
                className="text-[11px] text-t3 hover:text-t1 transition-colors bg-transparent border-none disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* File slots */}
        <section aria-label="Shared files">
          <div className="text-[10px] font-semibold text-t3 tracking-[0.08em] mb-[10px]">
            Files - any type, 25 MB max, expiry per file
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
            {displaySlots.map((slot, i) => {
              if (slot) {
                const label = expiryLabel(slot.expiresAt);
                const isWarn = label !== 'never' && !label.startsWith('7d') && !label.startsWith('30d');
                return (
                  <div
                    key={slot.id}
                    className="bg-s1 border border-white/10 rounded-xl p-5 flex flex-col items-center gap-2 min-h-[148px] text-center relative"
                  >
                    <div className={`absolute top-2 right-2 text-[9px] px-[6px] py-[2px] rounded border font-semibold ${
                      isWarn ? 'bg-warn/[0.07] text-warn border-warn/[0.18]' : 'bg-ok/[0.06] text-ok border-ok/[0.12]'
                    }`}>
                      {label}
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-t3 bg-s3 px-2 py-[3px] rounded mt-2">
                      {slot.ext}
                    </div>
                    <div className="text-[11px] font-medium text-t1 break-all">{slot.name}</div>
                    <div className="text-[10px] text-t3">{slot.size}</div>
                    <div className="mt-auto flex gap-2">
                      <a
                        href={slot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-[12px] py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t1 text-[10px] font-semibold hover:border-[var(--ac-glow)] transition-all"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => removeFile(slot)}
                        disabled={!isEditable}
                        aria-label={`Remove ${slot.name}`}
                        className="px-[8px] py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t3 text-[10px] hover:text-danger hover:border-danger/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-t3 disabled:hover:border-white/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              const uploadId = Object.keys(uploading)[0];
              const isUploading = i === files.length && uploadId !== undefined;

              return (
                <label
                  key={`empty-${i}`}
                  className={`bg-s1 border border-dashed rounded-xl p-5 flex flex-col items-center gap-2 min-h-[148px] text-center transition-all ${
                    !isEditable || files.length >= 3 ? 'opacity-40 cursor-not-allowed border-white/10' : 'border-white/10 hover:border-[var(--ac-glow)] cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    onChange={handleUpload}
                    className="sr-only"
                    disabled={!isEditable || files.length >= 3}
                    aria-label="Upload file to board"
                  />
                  {isUploading ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-s3 border border-white/10 flex items-center justify-center mt-2">
                        <div className="w-3 h-3 rounded-full border-2 border-ac border-t-transparent animate-spin" />
                      </div>
                      <div className="text-[11px] text-t2">Uploading...</div>
                      <div className="w-full bg-s3 rounded-full h-1 mt-1">
                        <div
                          className="bg-ac h-1 rounded-full transition-all"
                          style={{ width: `${uploading[uploadId]}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-t3">{uploading[uploadId]}%</div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-s3 border border-white/10 flex items-center justify-center mt-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="text-[11px] text-t3">Drop any file</div>
                      <div className="text-[10px] text-t3 leading-[1.7]">PDF, image, ZIP, any</div>
                      <select
                        value={expiry}
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) => setExpiry(e.target.value as ExpiryValue)}
                        className="w-full mt-auto px-2 py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t2 text-[10px] appearance-none cursor-pointer"
                      >
                        <option value="1h">Expires: 1 hour</option>
                        <option value="24h">Expires: 24 hours</option>
                      </select>
                    </>
                  )}
                </label>
              );
            })}
          </div>
        </section>
      </main>

      <AdUnit slot="1122334455" format="horizontal" className="w-full py-[9px] border-t border-white/[0.06]" />

      <Footer />

      {/* PIN dialog */}
      {pinDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPinDialog(null);
              setPinInput('');
              setPinConfirm('');
              setPinError('');
            }
          }}
        >
          <div className="bg-s1 border border-white/10 rounded-2xl p-6 w-full max-w-[300px]">
            {pinDialog === 'set' ? (
              <>
                <div className="font-semibold text-[14px] mb-1">Protect this board</div>
                <div className="text-[11px] text-t3 mb-5 leading-relaxed">
                  Set a PIN so only you can edit. Others can still view and download files.
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    autoFocus
                    type="password"
                    inputMode="numeric"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 8)); setPinError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('pin-confirm-input')?.focus()}
                    placeholder="Create PIN (4-8 digits)"
                    className="w-full bg-s2 border border-white/10 rounded-[8px] px-3 py-[9px] text-[13px] text-t1 placeholder-t3 outline-none focus:border-white/25 text-center font-mono tracking-[0.15em]"
                  />
                  <input
                    id="pin-confirm-input"
                    type="password"
                    inputMode="numeric"
                    value={pinConfirm}
                    onChange={(e) => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 8)); setPinError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPin()}
                    placeholder="Confirm PIN"
                    className="w-full bg-s2 border border-white/10 rounded-[8px] px-3 py-[9px] text-[13px] text-t1 placeholder-t3 outline-none focus:border-white/25 text-center font-mono tracking-[0.15em]"
                  />
                  {pinError && <div className="text-[11px] text-danger">{pinError}</div>}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleSetPin}
                      className="flex-1 bg-ac py-[9px] rounded-[7px] text-[12px] font-semibold text-white hover:bg-[#EA8C15] transition-colors"
                    >
                      Set PIN
                    </button>
                    <button
                      onClick={() => { setPinDialog(null); setPinInput(''); setPinConfirm(''); setPinError(''); }}
                      className="flex-1 border border-white/10 py-[9px] rounded-[7px] text-[12px] text-t2 hover:border-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-[14px] mb-1">Board protected</div>
                <div className="text-[11px] text-t3 mb-5 leading-relaxed">
                  Enter the PIN to unlock editing on this device.
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    autoFocus
                    type="password"
                    inputMode="numeric"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 8)); setPinError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Enter PIN"
                    className="w-full bg-s2 border border-white/10 rounded-[8px] px-3 py-[9px] text-[13px] text-t1 placeholder-t3 outline-none focus:border-white/25 text-center font-mono tracking-[0.15em]"
                  />
                  {pinError && <div className="text-[11px] text-danger">{pinError}</div>}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleUnlock}
                      className="flex-1 bg-ac py-[9px] rounded-[7px] text-[12px] font-semibold text-white hover:bg-[#EA8C15] transition-colors"
                    >
                      Unlock
                    </button>
                    <button
                      onClick={() => { setPinDialog(null); setPinInput(''); setPinError(''); }}
                      className="flex-1 border border-white/10 py-[9px] rounded-[7px] text-[12px] text-t2 hover:border-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
