const { Disclosure, Transition } = HeadlessUI;

function App() {
  const [inputs, setInputs] = React.useState({
    currentHomePrice: 800000,
    currentLoanBalance: 589000,
    currentLoanRate: 3.49,
    currentLoanTerm: 30,
    currentLoanStartDate: '2022-02-01',
    currentHomeAppreciation: 3,
    newHomePrice: 1169000,
    newHomeAppreciation: 3,
    savings: 120000,
    monthlySavingsStay: 3500,
    monthlySavingsBuy: 668,
    savingsInterestRate: 3.5,
    monthlyIncome: 16000,
    incomeGrowthPercent: 2,
    monthlyExpenses: 6000,
    inflationPercent: 2,
    monthlyDebt: 25,
    newLoanRate: 6.75,
    newLoanTerm: 30,
    downPaymentPercent: 20,
    propertyTaxPercent: 1.25,
    insurance: 200,
    realtorFeePercent: 6,
    closingCostPercent: 2,
  });
  const [comparisonYear, setComparisonYear] = React.useState(3);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState({});

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
    const currentEquity = inputs.currentHomePrice - inputs.currentLoanBalance;
    const downPayment = inputs.newHomePrice * (inputs.downPaymentPercent / 100);
    const closingCosts = inputs.newHomePrice * (inputs.closingCostPercent / 100);
    const realtorFees = inputs.currentHomePrice * (inputs.realtorFeePercent / 100);
    const savingsAfterBuy = inputs.savings + currentEquity - downPayment - closingCosts - realtorFees;
    const requiredDownPaymentNonNegative = inputs.savings + currentEquity - closingCosts - realtorFees;
    const loan = calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm);
    const monthlyPropertyTax = (inputs.newHomePrice * inputs.propertyTaxPercent) / 100 / 12;
    const totalPayment = loan.payment + monthlyPropertyTax + inputs.insurance;
    const monthlySavingsAfterExpenses = inputs.monthlyIncome - inputs.monthlyExpenses - totalPayment - inputs.monthlyDebt;
    const dti = (inputs.monthlyDebt + totalPayment) / inputs.monthlyIncome;
    const futureSavings = savingsAfterBuy * Math.pow(1 + inputs.savingsInterestRate / 100, 3) + inputs.monthlySavingsBuy * 12 * 3 * Math.pow(1 + inputs.savingsInterestRate / 100, 1.5);
    const futureEquity = inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, 3) - calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm, 36).remainingBalance;
    const futureIncome = inputs.monthlyIncome * Math.pow(1 + inputs.incomeGrowthPercent / 100, 3);
    const futureExpenses = inputs.monthlyExpenses * Math.pow(1 + inputs.inflationPercent / 100, 3);
    return {
      loan,
      downPayment,
      requiredDownPaymentNonNegative,
      savingsAfterBuy,
      netWorth: currentEquity + inputs.savings,
      totalPayment,
      dti,
      futureSavings,
      futureNetWorth: futureEquity + futureSavings,
      monthlySavingsAfterExpenses,
      calculations: {
        homeValues: {
          currentEquity: `Price ($${formatNumber(inputs.currentHomePrice)}) - Loan Balance ($${formatNumber(inputs.currentLoanBalance)}) = $${formatNumber(currentEquity)}`,
          futureEquity: `Future Price ($${formatNumber(inputs.newHomePrice * Math.pow(1 + inputs.newHomeAppreciation / 100, 3))}) - Loan Balance ($${formatNumber(calculateLoan(inputs.newHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm, 36).remainingBalance)}) = $${formatNumber(futureEquity)}`,
        },
        financials: {
          downPayment: `${inputs.downPaymentPercent}% of $${formatNumber(inputs.newHomePrice)} = $${formatNumber(downPayment)}`,
          requiredDownPaymentNonNegative: `Savings ($${formatNumber(inputs.savings)}) + Equity ($${formatNumber(currentEquity)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(requiredDownPaymentNonNegative)}`,
          closingCosts: `${inputs.closingCostPercent}% of $${formatNumber(inputs.newHomePrice)} = $${formatNumber(closingCosts)}`,
          realtorFees: `${inputs.realtorFeePercent}% of $${formatNumber(inputs.currentHomePrice)} = $${formatNumber(realtorFees)}`,
          savingsAfterBuy: `Savings ($${formatNumber(inputs.savings)}) + Equity ($${formatNumber(currentEquity)}) - Down Payment ($${formatNumber(downPayment)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(savingsAfterBuy)}`,
          futureSavings: `Initial ($${formatNumber(savingsAfterBuy)}) * (1 + ${inputs.savingsInterestRate / 100})^3 + Monthly ($${formatNumber(inputs.monthlySavingsBuy)} * 12 * 3) * (1 + ${inputs.savingsInterestRate / 100})^1.5 = $${formatNumber(futureSavings)}`,
          futureIncome: `$${formatNumber(inputs.monthlyIncome)} * (1 + ${inputs.incomeGrowthPercent / 100})^3 = $${formatNumber(futureIncome)}`,
          futureExpenses: `$${formatNumber(inputs.monthlyExpenses)} * (1 + ${inputs.inflationPercent / 100})^3 = $${formatNumber(futureExpenses)}`,
        },
        payments: {
          monthlyPropertyTax: `${inputs.propertyTaxPercent}% of $${formatNumber(inputs.newHomePrice)} / 12 = $${formatNumber(monthlyPropertyTax)}`,
          totalPayment: `Loan ($${formatNumber(loan.payment)}) + Tax ($${formatNumber(monthlyPropertyTax)}) + Insurance ($${formatNumber(inputs.insurance)}) = $${formatNumber(totalPayment)}`,
          monthlySavingsAfterExpenses: `Income ($${formatNumber(inputs.monthlyIncome)}) - Expenses ($${formatNumber(inputs.monthlyExpenses)}) - Payment ($${formatNumber(totalPayment)}) - Debt ($${formatNumber(inputs.monthlyDebt)}) = $${formatNumber(monthlySavingsAfterExpenses)}`,
        },
        metrics: {
          dti: `(Debt ($${formatNumber(inputs.monthlyDebt)}) + Payment ($${formatNumber(totalPayment)})) / Income ($${formatNumber(inputs.monthlyIncome)}) = ${(dti * 100).toFixed(2)}%`,
        },
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
    const futureIncome = inputs.monthlyIncome * Math.pow(1 + inputs.incomeGrowthPercent / 100, years);
    const futureExpenses = inputs.monthlyExpenses * Math.pow(1 + inputs.inflationPercent / 100, years);
    const closingCosts = futureNewHomePrice * (inputs.closingCostPercent / 100);
    const realtorFees = futureCurrentHomePrice * (inputs.realtorFeePercent / 100);
    
    const downPayment = futureNewHomePrice * (inputs.downPaymentPercent / 100);
    const downPaymentPercent = inputs.downPaymentPercent;
    const requiredDownPaymentNonNegative = futureSavings + futureEquity - closingCosts - realtorFees;
    const loan = calculateLoan(futureNewHomePrice - downPayment, inputs.newLoanRate, inputs.newLoanTerm);
    const monthlyPropertyTax = (futureNewHomePrice * inputs.propertyTaxPercent) / 100 / 12;
    const totalPayment = loan.payment + monthlyPropertyTax + inputs.insurance;
    const savingsAfterBuy = futureSavings + futureEquity - downPayment - closingCosts - realtorFees;
    const dti = (inputs.monthlyDebt + totalPayment) / futureIncome;
    const monthlySavingsAfterExpenses = futureIncome - futureExpenses - totalPayment - inputs.monthlyDebt;

    const targetSavings = inputs.monthlySavingsBuy;
    const monthlyRate = inputs.newLoanRate / 100 / 12;
    const n = inputs.newLoanTerm * 12;
    const totalPaymentAllowed = futureIncome - futureExpenses - targetSavings - inputs.monthlyDebt;
    const loanPayment = totalPaymentAllowed - monthlyPropertyTax - inputs.insurance;
    let requiredLoanAmount = 0;
    if (loanPayment > 0) {
      requiredLoanAmount = loanPayment * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n));
    }
    requiredLoanAmount = Math.min(requiredLoanAmount, futureNewHomePrice);
    const requiredDownPayment = futureNewHomePrice - requiredLoanAmount;
    const requiredDownPaymentPercent = (requiredDownPayment / futureNewHomePrice) * 100;

    return {
      year: years,
      loan,
      downPayment,
      downPaymentPercent,
      requiredDownPaymentNonNegative,
      savingsAfterBuy,
      netWorth: futureEquity + futureSavings,
      totalPayment,
      dti,
      futureSavings,
      monthlySavingsAfterExpenses,
      calculations: {
        homeValues: {
          futureCurrentHomePrice: `$${formatNumber(inputs.currentHomePrice)} * (1 + ${inputs.currentHomeAppreciation / 100})^${years} = $${formatNumber(futureCurrentHomePrice)}`,
          futureEquity: `Future Price ($${formatNumber(futureCurrentHomePrice)}) - Loan Balance ($${formatNumber(currentLoan.remainingBalance)}) = $${formatNumber(futureEquity)}`,
          futureNewHomePrice: `$${formatNumber(inputs.newHomePrice)} * (1 + ${inputs.newHomeAppreciation / 100})^${years} = $${formatNumber(futureNewHomePrice)}`,
        },
        financials: {
          futureSavings: `Initial ($${formatNumber(inputs.savings)}) * (1 + ${inputs.savingsInterestRate / 100})^${years} + Monthly ($${formatNumber(inputs.monthlySavingsStay)} * 12 * ${years}) * (1 + ${inputs.savingsInterestRate / 100})^${years}/2 = $${formatNumber(futureSavings)}`,
          futureIncome: `$${formatNumber(inputs.monthlyIncome)} * (1 + ${inputs.incomeGrowthPercent / 100})^${years} = $${formatNumber(futureIncome)}`,
          futureExpenses: `$${formatNumber(inputs.monthlyExpenses)} * (1 + ${inputs.inflationPercent / 100})^${years} = $${formatNumber(futureExpenses)}`,
          downPayment: `${inputs.downPaymentPercent}% of $${formatNumber(futureNewHomePrice)} = $${formatNumber(downPayment)}`,
          requiredDownPayment: `Target Savings ($${formatNumber(targetSavings)}) allows Total Payment ≤ $${formatNumber(totalPaymentAllowed)}; Loan Payment = $${formatNumber(loanPayment)}; Loan Amount = $${formatNumber(requiredLoanAmount)}; Required Down Payment = $${formatNumber(futureNewHomePrice)} - $${formatNumber(requiredLoanAmount)} = $${formatNumber(requiredDownPayment)} (${requiredDownPaymentPercent.toFixed(2)}%)`,
          requiredDownPaymentNonNegative: `Savings ($${formatNumber(futureSavings)}) + Equity ($${formatNumber(futureEquity)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(requiredDownPaymentNonNegative)}`,
          closingCosts: `${inputs.closingCostPercent}% of $${formatNumber(futureNewHomePrice)} = $${formatNumber(closingCosts)}`,
          realtorFees: `${inputs.realtorFeePercent}% of $${formatNumber(futureCurrentHomePrice)} = $${formatNumber(realtorFees)}`,
          savingsAfterBuy: `Savings ($${formatNumber(futureSavings)}) + Equity ($${formatNumber(futureEquity)}) - Down Payment ($${formatNumber(downPayment)}) - Closing Costs ($${formatNumber(closingCosts)}) - Realtor Fees ($${formatNumber(realtorFees)}) = $${formatNumber(savingsAfterBuy)}`,
        },
        payments: {
          monthlyPropertyTax: `${inputs.propertyTaxPercent}% of $${formatNumber(futureNewHomePrice)} / 12 = $${formatNumber(monthlyPropertyTax)}`,
          totalPayment: `Loan ($${formatNumber(loan.payment)}) + Tax ($${formatNumber(monthlyPropertyTax)}) + Insurance ($${formatNumber(inputs.insurance)}) = $${formatNumber(totalPayment)}`,
          monthlySavingsAfterExpenses: `Income ($${formatNumber(futureIncome)}) - Expenses ($${formatNumber(futureExpenses)}) - Payment ($${formatNumber(totalPayment)}) - Debt ($${formatNumber(inputs.monthlyDebt)}) = $${formatNumber(monthlySavingsAfterExpenses)}`,
        },
        metrics: {
          dti: `(Debt ($${formatNumber(inputs.monthlyDebt)}) + Payment ($${formatNumber(totalPayment)})) / Income ($${formatNumber(futureIncome)}) = ${(dti * 100).toFixed(2)}%`,
        },
      },
    };
  };

  const buyNow = calculateBuyNow();
  const stay = calculateStay(comparisonYear);

  const openModal = (calculations) => {
    setModalContent(calculations);
    setModalOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Inputs */}
      <div className="w-80 bg-gray-800 text-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Input Parameters</h2>
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-700 rounded-lg hover:bg-gray-600">
                <span>Current Home</span>
                <svg className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
                  <div className="mb-2 relative">
                    <label className="block">Price ($):</label>
                    <input type="number" name="currentHomePrice" value={inputs.currentHomePrice} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Current market value of your home">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Balance ($):</label>
                    <input type="number" name="currentLoanBalance" value={inputs.currentLoanBalance} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Remaining mortgage balance">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Rate (%):</label>
                    <input type="number" name="currentLoanRate" value={inputs.currentLoanRate} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual interest rate of current mortgage">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Term (Years):</label>
                    <input type="number" name="currentLoanTerm" value={inputs.currentLoanTerm} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Total term of current mortgage">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Start Date:</label>
                    <input type="date" name="currentLoanStartDate" value={inputs.currentLoanStartDate} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Start date of current mortgage">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Appreciation Rate (%):</label>
                    <input type="number" name="currentHomeAppreciation" value={inputs.currentHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="annual top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual home value growth rate">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Realtor Fee (%):</label>
                    <input type="number" name="realtorFeePercent" value={inputs.realtorFeePercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Commission for selling current home">?</span>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-700 rounded-lg hover:bg-gray-600">
                <span>New Home</span>
                <svg className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
                  <div className="mb-2 relative">
                    <label className="block">Price ($):</label>
                    <input type="number" name="newHomePrice" value={inputs.newHomePrice} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Purchase price of new home">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Appreciation Rate (%):</label>
                    <input type="number" name="newHomeAppreciation" value={inputs.newHomeAppreciation} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual home value growth rate">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Rate (%):</label>
                    <input type="number" name="newLoanRate" value={inputs.newLoanRate} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual interest rate for new mortgage">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Loan Term (Years):</label>
                    <input type="number" name="newLoanTerm" value={inputs.newLoanTerm} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Total term of new mortgage">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Down Payment (%):</label>
                    <input type="number" name="downPaymentPercent" value={inputs.downPaymentPercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Percentage of new home price paid upfront">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Closing Cost (%):</label>
                    <input type="number" name="closingCostPercent" value={inputs.closingCostPercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Costs for finalizing new home purchase">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Property Tax (%):</label>
                    <input type="number" name="propertyTaxPercent" value={inputs.propertyTaxPercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual property tax rate">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Insurance ($):</label>
                    <input type="number" name="insurance" value={inputs.insurance} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Monthly homeowners insurance cost">?</span>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-700 rounded-lg hover:bg-gray-600">
                <span>Finances</span>
                <svg className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
                  <div className="mb-2 relative">
                    <label className="block">Savings ($):</label>
                    <input type="number" name="savings" value={inputs.savings} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Current cash savings">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Savings (Stay) ($):</label>
                    <input type="number" name="monthlySavingsStay" value={inputs.monthlySavingsStay} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Monthly savings if staying in current home">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Savings (Buy) ($):</label>
                    <input type="number" name="monthlySavingsBuy" value={inputs.monthlySavingsBuy} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Target monthly savings after buying new home">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Savings Interest Rate (%):</label>
                    <input type="number" name="savingsInterestRate" value={inputs.savingsInterestRate} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual return on savings">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Income ($):</label>
                    <input type="number" name="monthlyIncome" value={inputs.monthlyIncome} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Current monthly income">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Income Growth (%):</label>
                    <input type="number" name="incomeGrowthPercent" value={inputs.incomeGrowthPercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual income growth rate">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Expenses ($):</label>
                    <input type="number" name="monthlyExpenses" value={inputs.monthlyExpenses} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Current monthly expenses">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Inflation Rate (%):</label>
                    <input type="number" name="inflationPercent" value={inputs.inflationPercent} onChange={handleInputChange} className="border p-2 w-full text-black" step="0.1" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Annual expense inflation rate">?</span>
                  </div>
                  <div className="mb-2 relative">
                    <label className="block">Monthly Debt ($):</label>
                    <input type="number" name="monthlyDebt" value={inputs.monthlyDebt} onChange={handleInputChange} className="border p-2 w-full text-black" />
                    <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title="Monthly debt payments">?</span>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
        <div className="mt-4">
          <label className="block text-sm font-medium">Compare in Year:</label>
          <select value={comparisonYear} onChange={(e) => setComparisonYear(parseInt(e.target.value))} className="border p-2 w-full text-black">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Home Purchase Comparison</h1>
        <table className="w-full border-collapse border mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Scenario</th>
              <th className="border p-2">Monthly Payment</th>
              <th className="border p-2">Monthly Savings</th>
              <th className="border p-2">Down Payment</th>
              <th className="border p-2">Required Down Payment (Non-Negative Savings)</th>
              <th className="border p-2">Savings After Buy</th>
              <th className="border p-2">Future Savings</th>
              <th className="border p-2">Net Worth</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                Buy Now
                <button onClick={() => openModal(buyNow.calculations)} className="ml-2 text-blue-500 hover:underline">View Math</button>
              </td>
              <td className="border p-2 font-bold">${formatNumber(buyNow.totalPayment)}</td>
              <td className="border p-2 ${buyNow.monthlySavingsAfterExpenses >= 0 ? 'text-green-600' : 'text-red-600'}">${formatNumber(buyNow.monthlySavingsAfterExpenses)}</td>
              <td className="border p-2">${formatNumber(buyNow.downPayment)}</td>
              <td className="border p-2">${formatNumber(buyNow.requiredDownPaymentNonNegative)}</td>
              <td className="border p-2 ${buyNow.savingsAfterBuy >= 0 ? 'text-green-600' : 'text-red-600'}">${formatNumber(buyNow.savingsAfterBuy)}</td>
              <td className="border p-2">${formatNumber(buyNow.futureSavings)}</td>
              <td className="border p-2 font-bold">${formatNumber(buyNow.futureNetWorth)}</td>
            </tr>
            <tr>
              <td className="border p-2">
                Stay {stay.year} Year{stay.year > 1 ? 's' : ''}
                <button onClick={() => openModal(stay.calculations)} className="ml-2 text-blue-500 hover:underline">View Math</button>
              </td>
              <td className="border p-2 font-bold">${formatNumber(stay.totalPayment)}</td>
              <td className="border p-2 ${stay.monthlySavingsAfterExpenses >= 0 ? 'text-green-600' : 'text-red-600'}">${formatNumber(stay.monthlySavingsAfterExpenses)}</td>
              <td className="border p-2">${formatNumber(stay.downPayment)}</td>
              <td className="border p-2">${formatNumber(stay.requiredDownPaymentNonNegative)}</td>
              <td className="border p-2 ${stay.savingsAfterBuy >= 0 ? 'text-green-600' : 'text-red-600'}">${formatNumber(stay.savingsAfterBuy)}</td>
              <td className="border p-2">${formatNumber(stay.futureSavings)}</td>
              <td className="border p-2 font-bold">${formatNumber(stay.netWorth)}</td>
            </tr>
          </tbody>
        </table>
        <h2 className="text-xl font-semibold mt-4">Should You Buy Now or Wait?</h2>
        <div className="mt-2">
          <p className="mb-2"><strong>Buy Now:</strong></p>
          <ul className="list-disc pl-5 mb-4">
            <li>Monthly Payment: ${formatNumber(buyNow.totalPayment)}</li>
            <li>Monthly Savings: ${formatNumber(buyNow.monthlySavingsAfterExpenses)}</li>
            <li>Down Payment: ${formatNumber(buyNow.downPayment)}</li>
            <li>Required Down Payment (Non-Negative Savings): ${formatNumber(buyNow.requiredDownPaymentNonNegative)}</li>
            <li>Savings After Buy: ${formatNumber(buyNow.savingsAfterBuy)}</li>
            <li>Future Savings (Year 3): ${formatNumber(buyNow.futureSavings)}</li>
            <li>Net Worth (Year 3): ${formatNumber(buyNow.futureNetWorth)}</li>
          </ul>
          <p className="mb-2"><strong>Wait {stay.year} Year{stay.year > 1 ? 's' : ''}:</strong></p>
          <ul className="list-disc pl-5 mb-4">
            <li>Monthly Payment: ${formatNumber(stay.totalPayment)}</li>
            <li>Monthly Savings: ${formatNumber(stay.monthlySavingsAfterExpenses)}</li>
            <li>Down Payment: ${formatNumber(stay.downPayment)}</li>
            <li>Required Down Payment (Non-Negative Savings): ${formatNumber(stay.requiredDownPaymentNonNegative)}</li>
            <li>Savings After Buy: ${formatNumber(stay.savingsAfterBuy)}</li>
            <li>Future Savings (Year {stay.year}): ${formatNumber(stay.futureSavings)}</li>
            <li>Net Worth (Year {stay.year}): ${formatNumber(stay.netWorth)}</li>
          </ul>
          <p className="font-semibold">Key Considerations:</p>
          <p>Buying now locks in a home price of ${formatNumber(inputs.newHomePrice)} but requires a ${formatNumber(buyNow.downPayment)} down payment (${formatNumber(buyNow.requiredDownPaymentNonNegative)} to avoid negative savings) and a monthly payment of ${formatNumber(buyNow.totalPayment)}, leaving ${formatNumber(buyNow.monthlySavingsAfterExpenses)} in monthly savings. Your savings grow to ${formatNumber(buyNow.futureSavings)} and net worth to ${formatNumber(buyNow.futureNetWorth)} in 3 years.</p>
          <p>Waiting {stay.year} year{stay.year > 1 ? 's' : ''} allows you to save ${formatNumber(inputs.monthlySavingsStay)} monthly, growing savings to ${formatNumber(stay.futureSavings)}. The home price rises to ${formatNumber(stay.calculations.homeValues.futureNewHomePrice.split(' = ')[1].replace('$', '').replace(/,/g, ''))}, requiring a ${formatNumber(stay.downPayment)} down payment (${formatNumber(stay.requiredDownPaymentNonNegative)} for non-negative savings). Monthly savings after buying are ${formatNumber(stay.monthlySavingsAfterExpenses)}, with a net worth of ${formatNumber(stay.netWorth)}.</p>
          <p><strong>Recommendation:</strong> Buy now if you can afford the payments and want equity growth. Wait if you need more savings or prefer lower payments now.</p>
        </div>
        <ReactModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          contentLabel="Calculation Details"
        >
          <h2 className="text-xl font-bold mb-4">Calculation Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Home Values</h3>
              {Object.values(modalContent.homeValues || {}).map((calc, idx) => (
                <p key={idx} className="text-sm">{calc}</p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">Financials</h3>
              {Object.values(modalContent.financials || {}).map((calc, idx) => (
                <p key={idx} className="text-sm">{calc}</p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">Payments</h3>
              {Object.values(modalContent.payments || {}).map((calc, idx) => (
                <p key={idx} className="text-sm">{calc}</p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">Metrics</h3>
              {Object.values(modalContent.metrics || {}).map((calc, idx) => (
                <p key={idx} className="text-sm">{calc}</p>
              ))}
            </div>
          </div>
          <button onClick={() => setModalOpen(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Close</button>
        </ReactModal>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
