'use client';

import { useState, useEffect } from 'react';

export default function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
  const [annualReturn, setAnnualReturn] = useState('12');
  const [investmentYears, setInvestmentYears] = useState('5');
  const [result, setResult] = useState<{
    totalInvested: number;
    estimatedReturns: number;
    totalValue: number;
  } | null>(null);

  const calculateSip = () => {
    const P = parseFloat(monthlyInvestment);
    const annualRate = parseFloat(annualReturn);
    const years = parseFloat(investmentYears);

    if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || years <= 0) {
      return;
    }

    // Monthly rate
    const r = annualRate / 12 / 100;

    // Number of months
    const n = years * 12;

    // SIP Formula: FV = P * ((1 + r)^n - 1) / r * (1 + r)
    let FV = 0;
    if (r === 0) {
      FV = P * n;
    } else {
      FV = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    }

    const totalInvested = P * n;
    const estimatedReturns = FV - totalInvested;

    setResult({
      totalInvested,
      estimatedReturns,
      totalValue: FV,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate on any value change
  const handleMonthlyInvestmentChange = (value: string) => {
    setMonthlyInvestment(value);
  };

  const handleAnnualReturnChange = (value: string) => {
    setAnnualReturn(value);
  };

  const handleYearsChange = (value: string) => {
    setInvestmentYears(value);
  };

  // Trigger calculation whenever inputs change
  useEffect(() => {
    calculateSip();
  }, [monthlyInvestment, annualReturn, investmentYears]);

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-5 mb-4">
        {/* Monthly Investment */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Monthly Investment
          </label>
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => handleMonthlyInvestmentChange(e.target.value)}
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="10000"
          />
          <div className="text-[10px] text-[#52525B] mt-1">
            Amount in INR
          </div>
        </div>

        {/* Annual Return */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Expected Annual Return %
          </label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => handleAnnualReturnChange(e.target.value)}
            step="0.1"
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="12"
          />
          <div className="text-[10px] text-[#52525B] mt-1">
            P.A. (typical: 10-15%)
          </div>
        </div>

        {/* Investment Period */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B] mb-[6px]">
            Investment Period (Years)
          </label>
          <input
            type="number"
            value={investmentYears}
            onChange={(e) => handleYearsChange(e.target.value)}
            step="0.5"
            className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40 transition-colors"
            placeholder="5"
          />
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="bg-[#18181C] border border-white/10 rounded-xl p-5">
          <div className="space-y-6">
            {/* Total Amount Invested */}
            <div>
              <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
                Total Amount Invested
              </div>
              <div className="text-[28px] font-bold text-[#FAFAFA] font-mono">
                {formatCurrency(result.totalInvested)}
              </div>
            </div>

            {/* Estimated Returns */}
            <div>
              <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
                Estimated Returns
              </div>
              <div className="text-[28px] font-bold text-[#22C55E] font-mono">
                {formatCurrency(result.estimatedReturns)}
              </div>
            </div>

            {/* Total Value at Maturity */}
            <div className="border-t border-white/[0.06] pt-6">
              <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.06em] mb-2">
                Total Value at Maturity
              </div>
              <div className="text-[40px] font-bold text-[#F97316] font-mono">
                {formatCurrency(result.totalValue)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
