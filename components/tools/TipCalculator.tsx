'use client';

import { useState } from 'react';

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState('100');
  const [tipPercentage, setTipPercentage] = useState('15');
  const [numberOfPeople, setNumberOfPeople] = useState('1');

  const bill = parseFloat(billAmount) || 0;
  const tip = parseFloat(tipPercentage) || 0;
  const people = Math.max(1, parseInt(numberOfPeople) || 1);

  const tipAmount = (bill * tip) / 100;
  const totalBill = bill + tipAmount;
  const perPerson = totalBill / people;
  const tipPerPerson = tipAmount / people;

  const tipPresets = [
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
    { label: '25%', value: 25 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5 mb-4">
        {/* Bill Amount */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Bill Amount
          </label>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            step="0.01"
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="100"
          />
        </div>

        {/* Tip Percentage */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Tip Percentage
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {tipPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTipPercentage(preset.value.toString())}
                className={`py-2 rounded-[7px] text-[11px] font-semibold transition-colors ${
                  parseFloat(tipPercentage) === preset.value
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#18181C] border border-white/10 text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={tipPercentage}
            onChange={(e) => setTipPercentage(e.target.value)}
            step="1"
            min="0"
            max="100"
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="15"
          />
        </div>

        {/* Tip Slider */}
        <div className="mb-4">
          <input
            type="range"
            value={tipPercentage}
            onChange={(e) => setTipPercentage(e.target.value)}
            min="0"
            max="30"
            step="1"
            className="w-full h-1 bg-[#18181C] rounded-lg appearance-none cursor-pointer accent-[#F97316]"
          />
          <div className="text-[10px] text-[#52525B] mt-2">
            Range: 0% - 30%
          </div>
        </div>

        {/* Number of People */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Split Between (People)
          </label>
          <input
            type="number"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(e.target.value)}
            min="1"
            step="1"
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="1"
          />
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-[#18181C] border border-white/10 rounded-xl p-5">
        <div className="space-y-5">
          {/* Tip Amount */}
          <div>
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
              Tip Amount ({tip}%)
            </div>
            <div className="text-[28px] font-bold text-[#F97316] font-mono">
              {formatCurrency(tipAmount)}
            </div>
          </div>

          {/* Total Bill */}
          <div className="border-t border-white/[0.06] pt-5">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
              Total Bill
            </div>
            <div className="text-[32px] font-bold text-[#FAFAFA] font-mono">
              {formatCurrency(totalBill)}
            </div>
          </div>

          {/* Per Person */}
          <div className="border-t border-white/[0.06] pt-5">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
              Per Person ({people} {people === 1 ? 'person' : 'people'})
            </div>
            <div className="text-[32px] font-bold text-[#22C55E] font-mono">
              {formatCurrency(perPerson)}
            </div>
          </div>

          {/* Tip Per Person */}
          <div className="border-t border-white/[0.06] pt-5 pb-0">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
              Tip Per Person
            </div>
            <div className="text-[20px] font-bold text-[#52525B] font-mono">
              {formatCurrency(tipPerPerson)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
