'use client';

import { useState } from 'react';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    breakdown: string;
    nextBirthdayDays: number;
  } | null>(null);
  const [error, setError] = useState('');

  const calculateAge = () => {
    setError('');
    setResult(null);

    if (!dob) {
      setError('Please enter date of birth');
      return;
    }

    const birthDate = new Date(dob);
    const calculationDate = asOfDate ? new Date(asOfDate) : new Date();

    if (birthDate > calculationDate) {
      setError('Date of birth cannot be in the future');
      return;
    }

    // Calculate age
    let years = calculationDate.getFullYear() - birthDate.getFullYear();
    let months = calculationDate.getMonth() - birthDate.getMonth();
    let days = calculationDate.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const prevMonth = new Date(calculationDate.getFullYear(), calculationDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate next birthday
    const today = new Date();
    let nextBirthdayDate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    // If birthday already passed this year, calculate for next year
    if (nextBirthdayDate < today) {
      nextBirthdayDate = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const daysUntilBirthday = Math.ceil((nextBirthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      breakdown: `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`,
      nextBirthdayDays: daysUntilBirthday,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateAge();
    }
  };

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            />
          </div>

          {/* Calculate As Of */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              Calculate As Of (optional)
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
              placeholder="Leave blank for today"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateAge}
          className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors w-full"
        >
          Calculate Age
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
          {/* Main Age Display */}
          <div className="mb-6">
            <div className="text-[48px] font-bold text-[#F97316] font-mono">
              {result.years}
            </div>
            <div className="text-[11px] text-[#52525B] tracking-[0.06em] mt-1">
              Years Old
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="border-t border-white/[0.06] pt-4 mb-4">
            <div className="text-[11px] text-[#A1A1AA] tracking-[0.06em] mb-2">
              Full Breakdown
            </div>
            <div className="text-[14px] text-[#FAFAFA] font-mono">
              {result.breakdown}
            </div>
          </div>

          {/* Next Birthday */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="text-[11px] text-[#A1A1AA] tracking-[0.06em] mb-2">
              Days Until Next Birthday
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-bold text-[#22C55E] font-mono">
                {result.nextBirthdayDays}
              </div>
              <div className="text-[12px] text-[#52525B]">
                days
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
