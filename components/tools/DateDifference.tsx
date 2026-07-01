'use client';

import { useState } from 'react';

export default function DateDifference() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<{
    days: number;
    weeks: number;
    months: number;
    years: number;
    breakdown: string;
  } | null>(null);
  const [error, setError] = useState('');

  const calculateDifference = () => {
    setError('');
    setResult(null);

    if (!startDate || !endDate) {
      setError('Please enter both dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be after start date');
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

    // Calculate precise breakdown (Years, Months, Days)
    let tempDate = new Date(start);
    let years = 0;
    let months = 0;
    let days = 0;

    // Count full years
    while (new Date(tempDate.getFullYear() + 1, tempDate.getMonth(), tempDate.getDate()) <= end) {
      years++;
      tempDate = new Date(tempDate.getFullYear() + 1, tempDate.getMonth(), tempDate.getDate());
    }

    // Count full months
    while (new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate()) <= end) {
      months++;
      tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate());
    }

    // Count remaining days
    days = Math.floor((end.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      days: diffDays,
      weeks: diffWeeks,
      months: diffMonths,
      years: diffYears,
      breakdown: `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`,
    });
  };

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateDifference}
          className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full"
        >
          Calculate
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-[#18181C] border border-white/10 rounded-xl p-5 text-[#F43F5E] text-sm">
          {error}
        </div>
      )}

      {/* Results Display */}
      {result && !error && (
        <div className="bg-[#18181C] border border-white/10 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[32px] font-bold text-[#F97316] font-mono">
                {result.days}
              </div>
              <div className="text-[11px] text-[#52525B] tracking-[0.06em] mt-1">
                Days
              </div>
            </div>

            <div>
              <div className="text-[32px] font-bold text-[#F97316] font-mono">
                {result.weeks}
              </div>
              <div className="text-[11px] text-[#52525B] tracking-[0.06em] mt-1">
                Weeks
              </div>
            </div>

            <div>
              <div className="text-[32px] font-bold text-[#F97316] font-mono">
                {result.months}
              </div>
              <div className="text-[11px] text-[#52525B] tracking-[0.06em] mt-1">
                Months (Approx)
              </div>
            </div>

            <div>
              <div className="text-[32px] font-bold text-[#F97316] font-mono">
                {result.years}
              </div>
              <div className="text-[11px] text-[#52525B] tracking-[0.06em] mt-1">
                Years (Approx)
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="text-[11px] text-[#A1A1AA] tracking-[0.06em] mb-2">
              Precise Breakdown
            </div>
            <div className="text-[14px] text-[#FAFAFA] font-mono">
              {result.breakdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
