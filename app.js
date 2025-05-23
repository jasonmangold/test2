function App() {
  const [inputs, setInputs] = React.useState({
    currentHomePrice: 300000,
    currentLoanBalance: 200000,
    currentLoanRate: 4,
    currentLoanTerm: 30,
    currentHomeAppreciation: 5,
    newHomePrice: 400000,
    newHomeAppreciation: 5,
    currentEquity: 100000,
    savings: 50000,
    monthlySavings: 1000,
    savingsInterestRate: 3,
    monthlyIncome: 6000,
    monthlyDebt: 1500,
    newLoanRate: 5,
    newLoanTerm: 30,
    downPaymentPercent: 20,
    propertyTaxPercent: 1.2,
    insurance: 100,
  });

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
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
    const savingsAfterBuy = inputs.savings - downPayment;
    const loan = calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm);
    const monthlyPropertyTax = (inputs.newHomePrice * inputs.propertyTaxPercent) / 100 / 12;
    const totalPayment = loan.payment + monthlyPropertyTax + inputs.insurance;
    const dti = (inputs.monthlyDebt + totalPayment) / inputs.monthlyIncome;
    return {
      loan,
      downPayment,
      savingsAfterBuy: savingsAfterBuy > 0 ? savingsAfterBuy : 0,
      netWorth: inputs.currentEquity + inputs.savings,
      totalPayment,
      dti,
    };
  };

  const calculateStay = (years) => {
    const months = years * 12;
    const currentLoan = calculateLoan(inputs.currentLoanBalance, inputs.currentLoanRate, inputs.currentLoanTerm, months);
    const futureSavings = inputs.savings * Math.pow(1 + inputs.savingsInterestRate / 100, years) + inputs.monthlySavings * 12 * years * Math.pow(1 + inputs.savingsInterestRate / 100, years / 2);
    const futureCurrentHomePrice = inputs.currentHomePrice * Math.pow(1 + inputs.currentHomeAppreciation / 100, years);
    const futureEquity = futureCurrentHomePrice - currentLoan.remainingBalance;
    const futureNewHomePrice = inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, years);
    const downPayment = futureNewHomePrice * (inputs.downPaymentPercent / 100);
    const savingsAfterBuy = futureSavings - downPayment;
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
    };
  };

  const buyNow = calculateBuyNow();
  const stay = [1, 2, 3].map((year) => calculateStay(year));

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Home Purchase Comparison</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block">Current Home Price ($):</label>
          <input type="number" name="currentHomePrice" value={inputs.currentHomePrice} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Current Loan Balance ($):</label>
          <input type="number" name="currentLoanBalance" value={inputs.currentLoanBalance} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Current Loan Rate (%):</label>
          <input type="number" name="currentLoanRate" value={inputs.currentLoanRate} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
        </div>
        <div>
          <label className="block">Current Loan Term (Years):</label>
          <input type="number" name="currentLoanTerm" value={inputs.currentLoanTerm} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Current Home Appreciation (%):</label>
          <input type="number" name="currentHomeAppreciation" value={inputs.currentHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
        </div>
        <div>
          <label className="block">New Home Price ($):</label>
          <input type="number" name="newHomePrice" value={inputs.newHomePrice} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">New Home Appreciation (%):</label>
          <input type="number" name="newHomeAppreciation" value={inputs.newHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
        </div>
        <div>
          <label className="block">Current Equity ($):</label>
          <input type="number" name="currentEquity" value={inputs.currentEquity} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Savings ($):</label>
          <input type="number" name="savings" value={inputs.savings} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Monthly Savings ($):</label>
          <input type="number" name="monthlySavings" value={inputs.monthlySavings} onChange={handleInputChange} className="border p-2 w-full" />
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
        <div>
          <label className="block">New Loan Rate (%):</label>
          <input type="number" name="newLoanRate" value={inputs.newLoanRate} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
        </div>
        <div>
          <label className="block">New Loan Term (Years):</label>
          <input type="number" name="newLoanTerm" value={inputs.newLoanTerm} onChange={handleInputChange} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block">Down Payment (%):</label>
          <input type="number" name="downPaymentPercent" value={inputs.downPaymentPercent} onChange={handleInputChange} className="border p-2 w-full" step="0.1" />
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
      <h2 className="text-xl font-semibold">Results</h2>
      <table className="w-full border-collapse border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Scenario</th>
            <th className="border p-2">Total Monthly Payment ($)</th>
            <th className="border p-2">Down Payment ($)</th>
            <th className="border p-2">Savings After Buy ($)</th>
            <th className="border p-2">Net Worth ($)</th>
            <th className="border p-2">Debt-to-Income Ratio (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Buy Now</td>
            <td className="border p-2">{buyNow.totalPayment.toFixed(2)}</td>
            <td className="border p-2">{buyNow.downPayment.toFixed(2)}</td>
            <td className="border p-2">{buyNow.savingsAfterBuy.toFixed(2)}</td>
            <td className="border p-2">{buyNow.netWorth.toFixed(2)}</td>
            <td className="border p-2">{(buyNow.dti * 100).toFixed(2)}</td>
          </tr>
          {stay.map((s) => (
            <tr key={s.year}>
              <td className="border p-2">Stay {s.year} Year{s.year > 1 ? 's' : ''}</td>
              <td className="border p-2">{s.totalPayment.toFixed(2)}</td>
              <td className="border p-2">{s.downPayment.toFixed(2)}</td>
              <td className="border p-2">{s.savingsAfterBuy.toFixed(2)}</td>
              <td className="border p-2">{s.netWorth.toFixed(2)}</td>
              <td className="border p-2">{(s.dti * 100).toFixed(2)}</td>
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
              <td className="border p-2">{month.payment.toFixed(2)}</td>
              <td className="border p-2">{month.principal.toFixed(2)}</td>
              <td className="border p-2">{month.interest.toFixed(2)}</td>
              <td className="border p-2">{month.balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
