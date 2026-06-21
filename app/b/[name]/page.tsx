'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AdUnit from '@/components/AdUnit';
import { db, storage } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

type ExpiryValue = '1h' | '24h' | '7d' | '30d' | 'never';

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

function expiryMs(val: ExpiryValue): number | null {
  const map: Record<ExpiryValue, number | null> = {
    '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000, 'never': null,
  };
  return map[val];
}

export default function BoardPage() {
  const params = useParams();
  const boardName = (params?.name as string) || 'swift-tiger-42';

  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileSlot[]>([]);
  const [expiry, setExpiry] = useState<ExpiryValue>('24h');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [synced, setSynced] = useState(true);

  const textDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isRemote = useRef(false);

  const boardRef = doc(db, 'boards', boardName);

  const purgeFile = useCallback(async (slot: FileSlot, currentFiles: FileSlot[]) => {
    const updated = currentFiles.filter((f) => f.id !== slot.id);
    try { await deleteObject(ref(storage, slot.storagePath)); } catch {}
    await updateDoc(boardRef, { files: updated }).catch(() => {});
  }, [boardName]);

  useEffect(() => {
    const unsub = onSnapshot(boardRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      isRemote.current = true;
      setText(data.text ?? '');

      const now = Date.now();
      const all: FileSlot[] = data.files ?? [];
      // Only filter display — global CleanupWorker handles actual deletion
      const live = all.filter((f) => !f.expiresAt || f.expiresAt > now);

      setFiles(live);
      setSynced(true);

      // Schedule in-session removal for files expiring while the board is open
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
    });

    return () => {
      unsub();
      Object.values(expiryTimers.current).forEach(clearTimeout);
    };
  }, [boardName]);

  const pushText = useCallback((val: string) => {
    setSynced(false);
    if (textDebounce.current) clearTimeout(textDebounce.current);
    textDebounce.current = setTimeout(async () => {
      await setDoc(boardRef, { text: val }, { merge: true });
      setSynced(true);
    }, 600);
  }, [boardName]);

  const handleTextChange = (val: string) => {
    if (isRemote.current) { isRemote.current = false; return; }
    setText(val);
    pushText(val);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || files.length >= 3) return;
    e.target.value = '';

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const storagePath = `boards/${boardName}/${id}-${f.name}`;
    const storageRef = ref(storage, storagePath);
    const ms = expiryMs(expiry);

    const newSlot: FileSlot = {
      id, name: f.name, ext: extFromName(f.name),
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      url: '', storagePath,
      expiresAt: ms ? Date.now() + ms : null,
    };

    setUploading((prev) => ({ ...prev, [id]: 0 }));
    const task = uploadBytesResumable(storageRef, f);

    task.on('state_changed',
      (snap) => {
        const pct = Math.round(snap.bytesTransferred / snap.totalBytes * 100);
        setUploading((prev) => ({ ...prev, [id]: pct }));
      },
      () => { setUploading((prev) => { const n = { ...prev }; delete n[id]; return n; }); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const finalized = { ...newSlot, url };
        setUploading((prev) => { const n = { ...prev }; delete n[id]; return n; });
        const updatedFiles = [...files, finalized];
        const nextCleanupAt = updatedFiles
          .filter((f) => f.expiresAt)
          .reduce((min, f) => Math.min(min, f.expiresAt!), Infinity);
        await updateDoc(boardRef, {
          files: updatedFiles,
          nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null,
        }).catch(() => setDoc(boardRef, { text, files: updatedFiles, nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null }));
      }
    );
  };

  const removeFile = async (slot: FileSlot) => {
    const updated = files.filter((f) => f.id !== slot.id);
    setFiles(updated);
    try { await deleteObject(ref(storage, slot.storagePath)); } catch {}
    const nextCleanupAt = updated.filter((f) => f.expiresAt)
      .reduce((min, f) => Math.min(min, f.expiresAt!), Infinity);
    await updateDoc(boardRef, {
      files: updated,
      nextCleanupAt: isFinite(nextCleanupAt) ? nextCleanupAt : null,
    });
  };

  const clearAll = async () => {
    for (const f of files) {
      try { await deleteObject(ref(storage, f.storagePath)); } catch {}
    }
    setText('');
    setFiles([]);
    await setDoc(boardRef, { text: '', files: [], nextCleanupAt: null });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://clipvault-tools.vercel.app/b/${boardName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displaySlots = [
    ...files.slice(0, 3),
    ...Array(Math.max(0, 3 - files.length)).fill(null),
  ] as (FileSlot | null)[];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-t1">
      <Nav />

      <header className="px-5 sm:px-7 py-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[22px] font-semibold tracking-[-0.01em] mb-2">
              {boardName}
            </div>
            <div className="flex items-center gap-2 mb-[6px]">
              <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-[5px] bg-ok/[0.06] text-ok border border-ok/[0.15]">
                <div className="w-[5px] h-[5px] rounded-full bg-ok animate-pulse" />
                Live
              </div>
              <div className="bg-s2 text-t3 border border-white/[0.06] text-[10px] px-2 py-[3px] rounded-[5px] font-medium">
                Free board
              </div>
            </div>
            <div className="text-[10px] text-t3 font-mono">
              clipvault-tools.vercel.app/b/<span className="text-t2">{boardName}</span>
            </div>
          </div>

          <div className="flex gap-[6px]">
            <button
              onClick={copyLink}
              className="px-[11px] py-[6px] bg-s2 border border-white/10 rounded-[7px] text-t2 text-[11px] font-medium hover:border-[var(--ac-glow)] transition-all"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              onClick={clearAll}
              className="px-[11px] py-[6px] bg-s2 border border-danger/20 rounded-[7px] text-danger text-[11px] font-medium hover:border-danger/40 transition-all"
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-7 py-[22px]">
        {/* Text slot */}
        <section aria-label="Shared text" className="mb-8">
          <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] mb-[10px]">
            Text - live sync, never expires
          </div>
          <div className="bg-s1 border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="relative px-5 py-4">
              <div className="flex items-center gap-1 text-[10px] text-ok absolute top-4 right-4">
                <div className={`w-[4px] h-[4px] rounded-full bg-ok ${synced ? '' : 'opacity-40'}`} />
                {synced ? 'synced' : 'syncing...'}
              </div>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value.slice(0, 65000))}
                placeholder="Start typing - changes sync to all connected devices instantly"
                aria-label="Shared board text"
                maxLength={65000}
                className="w-full bg-transparent outline-none resize-y text-t1 text-[13px] leading-relaxed pr-20 min-h-[180px] max-h-[70vh] overflow-y-auto"
              />
            </div>
            <div className="flex items-center justify-between px-5 py-[10px] border-t border-white/[0.06]">
              <span className={`text-[11px] font-mono ${text.length >= 65000 ? 'text-danger' : text.length > 60000 ? 'text-warn' : 'text-t3'}`}>
                {text.length.toLocaleString()} / 65,000
              </span>
              <button
                onClick={() => { setText(''); pushText(''); }}
                className="text-[11px] text-t3 hover:text-t1 transition-colors bg-transparent border-none"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* File slots */}
        <section aria-label="Shared files">
          <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] mb-[10px]">
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
                        aria-label={`Remove ${slot.name}`}
                        className="px-[8px] py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t3 text-[10px] hover:text-danger hover:border-danger/20 transition-all"
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
                  className={`bg-s1 border border-dashed rounded-xl p-5 flex flex-col items-center gap-2 min-h-[148px] text-center transition-all cursor-pointer ${
                    files.length >= 3 ? 'opacity-40 cursor-not-allowed border-white/10' : 'border-white/10 hover:border-[var(--ac-glow)]'
                  }`}
                >
                  <input
                    type="file"
                    onChange={handleUpload}
                    className="sr-only"
                    disabled={files.length >= 3}
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
                        <option value="7d">Expires: 7 days</option>
                        <option value="30d">Expires: 30 days</option>
                        <option value="never">Never</option>
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
    </div>
  );
}
