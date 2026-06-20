'use client';

import { useEffect, useState } from 'react';

export default function TimestampConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [unixInput, setUnixInput] = useState<string>('');
  const [humanOutput, setHumanOutput] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [unixOutput, setUnixOutput] = useState<string>('');

  // Update current timestamp every second
  useEffect(() => {
    setCurrentTimestamp(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatHumanDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
      }) + ' UTC';
    } catch {
      return 'Invalid timestamp';
    }
  };

  const handleUnixConvert = () => {
    const num = parseInt(unixInput);
    if (!isNaN(num)) {
      setHumanOutput(formatHumanDate(num));
    } else {
      setHumanOutput('Invalid input');
    }
  };

  const handleDateConvert = () => {
    if (dateInput) {
      const date = new Date(dateInput);
      const timestamp = Math.floor(date.getTime() / 1000);
      setUnixOutput(timestamp.toString());
    } else {
      setUnixOutput('Invalid input');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Current Timestamp Display */}
      <div className="bg-[#111115] rounded-xl p-5 text-center">
        <p className="text-[#A1A1AA] text-xs mb-2 uppercase tracking-wide">
          Current Unix Timestamp
        </p>
        <p className="font-mono text-2xl text-[#FAFAFA]">{currentTimestamp}</p>
      </div>

      {/* Conversion Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unix to Human */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#FAFAFA]">
            Unix → Human
          </h3>
          <input
            type="text"
            placeholder="Enter Unix timestamp..."
            value={unixInput}
            onChange={(e) => setUnixInput(e.target.value)}
            className="w-full text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg px-3 py-2 text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#F97316]"
          />
          <button
            onClick={handleUnixConvert}
            className="w-full px-4 py-2 bg-[#F97316] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#F97316]/90 transition-colors"
          >
            Convert
          </button>
          {humanOutput && (
            <div className="bg-[#18181C] border border-white/10 rounded-lg p-3">
              <p className="text-xs text-[#A1A1AA] mb-1">Result:</p>
              <p className="text-sm text-[#FAFAFA]">{humanOutput}</p>
            </div>
          )}
        </div>

        {/* Date to Unix */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#FAFAFA]">
            Date → Unix
          </h3>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg px-3 py-2 text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#F97316]"
          />
          <button
            onClick={handleDateConvert}
            className="w-full px-4 py-2 bg-[#F97316] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#F97316]/90 transition-colors"
          >
            Convert
          </button>
          {unixOutput && (
            <div className="bg-[#18181C] border border-white/10 rounded-lg p-3">
              <p className="text-xs text-[#A1A1AA] mb-1">Result:</p>
              <p className="text-sm font-mono text-[#FAFAFA]">{unixOutput}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
