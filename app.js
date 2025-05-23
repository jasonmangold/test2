function App() {
  const [inputs, setInputs] = React.useState({
    currentHomePrice: 800000,
    currentLoanBalance: 554000,
    currentLoanRate: 3.49,
    currentLoanTerm: 30,
    currentLoanStartDate: '2022-02-01',
    currentHomeAppreciation: 3,
    newHomePrice: 1169000,
    newHomeAppreciation: 3,
    currentEquity: 0,
    savings: 120000,
    monthlySavingsStay: 3500,
    monthlySavingsBuy: 566800,
    savingsInterestRate: 3.5,
    monthlyIncome: 16000,
    monthlyDebt: 150250,
    newLoanRate: 6.75,
    newLoanTerm: 30,
    downPaymentPercent: 20,
    propertyTaxPercent: 1.25,
    insurance: 200,
    realtorFeePercent: 6,
    closingCostPercent: 2,
  });

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value });
  };

  const formatNumber = (num) => Math.round(num).toLocaleString();

  const calculateMonthsElapsed = (startDate) => {
    const start = new Date(startDate);
    const today = new Date('2025-05-23');
    return (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth();
  };

  const calculateLoan = (principal, rate, term, monthsElapsed = 0) => {
    const monthlyRate = rate / 100 / 12;
    const n = term * 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    let balance = principal;
    const schedule = [];
    for (let i = 0; i < n; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = payment - interest;
      balance -= principalPayment;
      if (i >= monthsElapsed) {
        schedule.push({ month: i + 1, payment, principal: principalPayment, interest, balance });
      }
    }
    return { payment, schedule, remainingBalance: schedule[0]?.balance || principal };
  };

  const calculateBuyNow = () => {
    const downPayment = inputs.newHomePrice * (inputs.downPaymentPercent / 100);
    const closingCosts = inputs.newHomePrice * (inputs.closingCostPercent / 100);
    const realtorFees = inputs.currentHomePrice * (inputs.realtorFeePercent / 100);
    const savingsAfterBuy = inputs.savings + inputs.currentEquity - downPayment - closingCosts - realtorFees;
    const loan = calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm);
    const monthlyPropertyTax = (inputs.newHomePrice * inputs.propertyTaxPercent) / 100 / 12;
    const totalPayment = loan.payment + monthlyPropertyTax + inputs.insurance;
    const dti = (inputs.monthlyDebt + totalPayment) / inputs.monthlyIncome;
    const futureSavings = savingsAfterBuy * Math.pow(1 + inputs.savingsInterestRate / 100, 3) + inputs.monthlySavingsBuy * 12 * 3 * Math.pow(1 + inputs.savingsInterestRate / 100, 1.5);
    const futureEquity = inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, 3) - calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm, 36).remainingBalance;
    return {
      loan,
      downPayment,
      savingsAfterBuy: savingsAfterBuy > 0 ? savingsAfterBuy : 0,
      netWorth: inputs.currentEquity + inputs.savings,
      totalPayment,
      dti,
      futureSavings,
      futureNetWorth: futureEquity + futureSavings,
      calculations: {
        downPayment: `${inputs.downPaymentPercent}% of $${formatNumber(inputs.newHomePrice)} = $${formatNumber(downPayment)}`,
        closingCosts: `${inputs.closingCostPercent}% of $${formatNumber(inputs.newHomePrice)} = $${formatNumber(closingCosts)}`,
        realtorFees: `${inputs.realtorFeePercent}% of $${formatNumber(inputs.currentHomePrice)} = $${formatNumber(realtorFees)}`,
        savingsAfterBuy: `Savings ($${formatNumber(inputs.savings)}) + Equity ($${formatNumber(inputs.currentEquity)}) - Down Payment ($${formatNumber(downPayment)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(savingsAfterBuy)}`,
        monthlyPropertyTax: `${inputs.propertyTaxPercent}% of $${formatNumber(inputs.newHomePrice)} / 12 = $${formatNumber(monthlyPropertyTax)}`,
        totalPayment: `Loan ($${formatNumber(loan.payment)}) + Tax ($${formatNumber(monthlyPropertyTax)}) + Insurance ($${formatNumber(inputs.insurance)}) = $${formatNumber(totalPayment)}`,
        dti: `(Debt ($${formatNumber(inputs.monthlyDebt)}) + Payment ($${formatNumber(totalPayment)})) / Income ($${formatNumber(inputs.monthlyIncome)}) = ${(dti * 100).toFixed(2)}%`,
        futureSavings: `Initial ($${formatNumber(savingsAfterBuy)}) * (1 + ${inputs.savingsInterestRate / 100})^3 + Monthly ($${formatNumber(inputs.monthlySavingsBuy)} * 12 * 3) * (1 + ${inputs.savingsInterestRate / 100})^1.5 = $${formatNumber(futureSavings)}`,
        futureEquity: `Future Price ($${formatNumber(inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, 3))}) - Loan Balance ($${formatNumber(calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm, 36).remainingBalance)}) = $${formatNumber(futureEquity)}`,
      },
    };
  };

  const calculateStay = (years) => {
    const months = years * 12;
    const monthsElapsed = calculateMonthsElapsed(inputs.currentLoanStartDate);
    const currentLoan = calculateLoan(inputs.currentLoanBalance, inputs.currentLoanRate, inputs.currentLoanTerm, monthsElapsed + months);
    const futureSavings = inputs.savings * Math.pow(1 + inputs.savingsInterestRate / 100, years) + inputs.monthlySavingsStay * 12 * years * Math.pow(1 + inputs.savingsInterestRate / 100, years / 2);
    const futureCurrentHomePrice = inputs.currentHomePrice * Math.pow(1 + inputs.currentHomeAppreciation / 100, years);
    const futureEquity = futureCurrentHomePrice - currentLoan.remainingBalance;
    const futureNewHomePrice = inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, years);
    const downPayment = futureNewHomePrice * (inputs.downPaymentPercent / 100);
    const closingCosts = futureNewHomePrice * (inputs.closingCostPercent / 100);
    const realtorFees = futureCurrentHomePrice * (inputs.realtorFeePercent / 100);
    const savingsAfterBuy = futureSavings + futureEquity - downPayment - closingCosts - realtorFees;
    const loan = calculateLoan(futureNewHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm);
    const monthlyPropertyTax = (futureNewHomePrice * inputs.propertyTaxPercent) / 100 / 12;
    const totalPayment = loan.payment + monthlyPropertyTax + inputs.insurance;
    const dti = (inputs.monthlyDebt + totalPayment) / inputs.monthlyIncome;
    return {
      year: years,
      loan,
      downPayment,
      savingsAfterBuy: savingsAfterBuy > 0 ? savingsAfterBuy : 0,
      netWorth: futureEquity + futureSavings,
      totalPayment,
      dti,
      calculations: {
        futureSavings: `Initial ($${formatNumber(inputs.savings)}) * (1 + ${inputs.savingsInterestRate / 100})^${years} + Monthly ($${formatNumber(inputs.monthlySavingsStay)} * 12 * ${years}) * (1 + ${inputs.savingsInterestRate / 100})^${years}/2 = $${formatNumber(futureSavings)}`,
        futureCurrentHomePrice: `$${formatNumber(inputs.currentHomePrice)} * (1 + ${inputs.currentHomeAppreciation / 100})^${years} = $${formatNumber(futureCurrentHomePrice)}`,
        futureEquity: `Future Price ($${formatNumber(futureCurrentHomePrice)}) - Loan Balance ($${formatNumber(currentLoan.remainingBalance)}) = $${formatNumber(futureEquity)}`,
        futureNewHomePrice: `$${formatNumber(inputs.newHomePrice)} * (1 + ${inputs.newHomeAppreciation / 100})^${years} = $${formatNumber(futureNewHomePrice)}`,
        downPayment: `${inputs.downPaymentPercent}% of $${formatNumber(futureNewHomePrice)} = $${formatNumber(downPayment)}`,
        closingCosts: `${inputs.closingCostPercent}% of $${formatNumber(futureNewHomePrice)} = $${formatNumber(closingCosts)}`,
        realtorFees: `${inputs.realtorFeePercent}% of $${formatNumber(futureCurrentHomePrice)} = $${formatNumber(realtorFees)}`,
        savingsAfterBuy: `Savings ($${formatNumber(futureSavings)}) + Equity ($${formatNumber(futureEquity)}) - Down Payment ($${formatNumber(downPayment)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(savingsAfterBuy)}`,
        monthlyPropertyTax: `${inputs.propertyTaxPercent}% of $${formatNumber(futureNewHomePrice)} / 12 = $${formatNumber(monthlyPropertyTax)}`,
        totalPayment: `Loan ($${formatNumber(loan.payment)}) + Tax ($${formatNumber(monthlyPropertyTax)}) + Insurance ($${formatNumber(inputs.insurance)}) = $${formatNumber(totalPayment)}`,
        dti: `(Debt ($${formatNumber(inputs.monthlyDebt)}) + Payment ($${formatNumber(totalPayment)})) / Income ($${formatNumber(inputs.monthlyIncome)}) = ${(dti * 100).toFixed(2)}%`,
      },
    };
  };

  const buyNow = calculateBuyNow();
  const stay = [1, 2, 3].map((year) => calculateStay(year));

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Home Purchase Comparison</h1>
      <h2 className="text-lg font-semibold mb-2">Input Parameters</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Current Home</h3>
          <div>
            <label className="block">Price ($):</label>
            <input type="number" name="currentHomePrice" value={inputs.currentHomePrice} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Loan Balance ($):</label>
            <input type="number" name="currentLoanBalance" value={inputs.currentLoanBalance} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Loan Rate (%):</label>
            <input type="number" name="currentLoanRate" value={inputs.currentLoanRate} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Loan Term (Years):</label>
            <input type="number" name="currentLoanTerm" value={inputs.currentLoanTerm} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Loan Start Date:</label>
            <input type="date" name="currentLoanStartDate" value={inputs.currentLoanStartDate} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Appreciation Rate (%):</label>
            <input type="number" name="currentHomeAppreciation" value={inputs.currentHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Equity ($):</label>
            <input type="number" name="currentEquity" value={inputs.currentEquity} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Realtor Fee (%):</label>
            <input type="number" name="realtorFeePercent" value={inputs.realtorFeePercent} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">New Home</h3>
          <div>
            <label className="block">Price ($):</label>
            <input type="number" name="newHomePrice" value={inputs.newHomePrice} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Appreciation Rate (%):</label>
            <input type="number" name="newHomeAppreciation" value={inputs.newHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Loan Rate (%):</label>
            <input type="number" name="newLoanRate" value={inputs.newLoanRate} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Loan Term (Years):</label>
            <input type="number" name="newLoanTerm" value={inputs.newLoanTerm} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Down Payment (%):</label>
            <input type="number" name="downPaymentPercent" value={inputs.downPaymentPercent} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Closing Cost (%):</label>
            <input type="number" name="closingCostPercent" value={inputs.closingCostPercent} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Property Tax (%):</label>
            <input type="number" name="propertyTaxPercent" value={inputs.propertyTaxPercent} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Monthly Insurance ($):</label>
            <input type="number" name="insurance" value={inputs.insurance} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Finances</h3>
          <div>
            <label className="block">Savings ($):</label>
            <input type="number" name="savings" value={inputs.savings} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Monthly Savings (Stay) ($):</label>
            <input type="number" name="monthlySavingsStay" value={inputs.monthlySavingsStay} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Monthly Savings (Buy) ($):</label>
            <input type="number" name="monthlySavingsBuy" value={inputs.monthlySavingsBuy} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Savings Interest Rate (%):</label>
            <input type="number" name="savingsInterestRate" value={inputs.savingsInterestRate} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
          </div>
          <div>
            <label className="block">Monthly Income ($):</label>
            <input type="number" name="monthlyIncome" value={inputs.monthlyIncome} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
          <div>
            <label className="block">Monthly Debt ($):</label>
            <input type="number" name="monthlyDebt" value={inputs.monthlyDebt} onChange={handleInputChange} className="border p-2 w-full" />
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Scenario Comparison (Year 3)</h2>
      <table className="w-full border-collapse border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Scenario</th>
            <th className="border p-2">Total Monthly Payment</th>
            <th className="border p-2">Down Payment</th>
            <th className="border p-2">Savings After Buy</th>
            <th className="border p-2">Net Worth</th>
            <th className="border p-2">Debt-to-Income Ratio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">
              Buy Now
              <div className="text-sm">
                <p>{buyNow.calculations.downPayment}</p>
                <p>{buyNow.calculations.closingCosts}</p>
                <p>{buyNow.calculations.realtorFees}</p>
                <p>{buyNow.calculations.savingsAfterBuy}</p>
                <p>{buyNow.calculations.monthlyPropertyTax}</p>
                <p>{buyNow.calculations.totalPayment}</p>
                <p>{buyNow.calculations.futureSavings}</p>
                <p>{buyNow.calculations.futureEquity}</p>
                <p>{buyNow.calculations.dti}</p>
              </div>
            </td>
            <td className="border p-2">${formatNumber(buyNow.totalPayment)}</td>
            <td className="border p-2">${formatNumber(buyNow.downPayment)}</td>
            <td className="border p-2">${formatNumber(buyNow.futureSavings)}</td>
            <td className="border p-2">${formatNumber(buyNow.futureNetWorth)}</td>
            <td className="border p-2">{(buyNow.dti * 100).toFixed(2)}%</td>
          </tr>
          {stay.map((s) => (
            <tr key={s.year}>
              <td className="border p-2">
                Stay {s.year} Year{s.year > 1 ? 's' : ''}
                <div className="text-sm">
                  <p>{s.calculations.futureCurrentHomePrice}</p>
                  <p>{s.calculations.futureEquity}</p>
                  <p>{s.calculations.futureNewHomePrice}</p>
                  <p>{s.calculations.futureSavings}</p>
                  <p>{s.calculations.downPayment}</p>
                  <p>{s.calculations.closingCosts}</p>
                  <p>{s.calculations.realtorFees}</p>
                  <p>{s.calculations.savingsAfterBuy}</p>
                  <p>{s.calculations.monthlyPropertyTax}</p>
                  <p>{s.calculations.totalPayment}</p>
                  <p>{s.calculations.dti}</p>
                </div>
              </td>
              <td className="border p-2">${formatNumber(s.totalPayment)}</td>
              <td className="border p-2">${formatNumber(s.downPayment)}</td>
              <td className="border p-2">${formatNumber(s.savingsAfterBuy)}</td>
              <td className="border p-2">${formatNumber(s.netWorth)}</td>
              <td className="border p-2">{(s.dti * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold mt-4">Amortization Schedule (Buy Now)</h2>
      <table className="w-full border-collapse border mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Month</th>
            <th className="border p-2">Payment ($)</th>
            <th className="border p-2">Principal ($)</th>
            <th className="border p-2">Interest ($)</th>
            <th className="border p-2">Balance ($)</th>
          </tr>
        </thead>
        <tbody>
          {buyNow.loan.schedule.slice(0, 12).map((month) => (
            <tr key={month.month}>
              <td className="border p-2">{month.month}</td>
              <td className="border p-2">${formatNumber(month.payment)}</td>
              <td className="border p-2">${formatNumber(month.principal)}</td>
              <td className="border p-2">${formatNumber(month.interest)}</td>
              <td className="border p-2">${formatNumber(month.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
