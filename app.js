function App() {
  // Check if HeadlessUI is defined
  const HeadlessUI = window.HeadlessUI;
  const hasHeadlessUI = !!HeadlessUI;

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

  // Fallback UI if HeadlessUI is not available
  const renderInputSection = (title, fields) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium bg-gray-700 px-4 py-2 rounded-lg">{title}</h3>
      <div className="px-4 pt-4 pb-2 text-sm">
        {fields.map(({ label, name, type, step, tooltip }) => (
          <div key={name} className="mb-2 relative">
            <label className="block">{label}</label>
            <input
              type={type}
              name={name}
              value={inputs[name]}
              onChange={handleInputChange}
              className="border p-2 w-full text-black"
              step={step}
            />
            <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title={tooltip}>?</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollapsibleInputSection = hasHeadlessUI
    ? ({ title, fields }) => {
        const { Disclosure, Transition } = HeadlessUI;
        return (
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-700 rounded-lg hover:bg-gray-600">
                  <span>{title}</span>
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
                    {fields.map(({ label, name, type, step, tooltip }) => (
                      <div key={name} className="mb-2 relative">
                        <label className="block">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={inputs[name]}
                          onChange={handleInputChange}
                          className="border p-2 w-full text-black"
                          step={step}
                        />
                        <span className="absolute top-0 right-0 text-xs text-gray-400 cursor-help" title={tooltip}>?</span>
                      </div>
                    ))}
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        );
      }
    : renderInputSection;

  const inputSections = [
    {
      title: 'Current Home',
      fields: [
        { label: 'Price ($):', name: 'currentHomePrice', type: 'number', tooltip: 'Current market value of your home' },
        { label: 'Loan Balance ($):', name: 'currentLoanBalance', type: 'number', tooltip: 'Remaining mortgage balance' },
        { label: 'Loan Rate (%):', name: 'currentLoanRate', type: 'number', step: '0.1', tooltip: 'Annual interest rate of current mortgage' },
        { label: 'Loan Term (Years):', name: 'currentLoanTerm', type: 'number', tooltip: 'Total term of current mortgage' },
        { label: 'Loan Start Date:', name: 'currentLoanStartDate', type: 'date', tooltip: 'Start date of current mortgage' },
        { label: 'Appreciation Rate (%):', name: 'currentHomeAppreciation', type: 'number', step: '0.1', tooltip: 'Annual home value growth rate' },
        { label: 'Realtor Fee (%):', name: 'realtorFeePercent', type: 'number', step: '0.1', tooltip: 'Commission for selling current home' },
      ],
    },
    {
      title: 'New Home',
      fields: [
        { label: 'Price ($):', name: 'newHomePrice', type: 'number', tooltip: 'Purchase price of new home' },
        { label: 'Appreciation Rate (%):', name: 'newHomeAppreciation', type: 'number', step: '0.1', tooltip: 'Annual home value growth rate' },
        { label: 'Loan Rate (%):', name: 'newLoanRate', type: 'number', step: '0.1', tooltip: 'Annual interest rate for new mortgage' },
        { label: 'Loan Term (Years):', name: 'newLoanTerm', type: 'number', tooltip: 'Total term of new mortgage' },
        { label: 'Down Payment (%):', name: 'downPaymentPercent', type: 'number', step: '0.1', tooltip: 'Percentage of new home price paid upfront' },
        { label: 'Closing Cost (%):', name: 'closingCostPercent', type: 'number', step: '0.1', tooltip: 'Costs for finalizing new home purchase' },
        { label: 'Property Tax (%):', name: 'propertyTaxPercent', type: 'number', step: '0.1', tooltip: 'Annual property tax rate' },
        { label: 'Monthly Insurance ($):', name: 'insurance', type: 'number', tooltip: 'Monthly homeowners insurance cost' },
      ],
    },
    {
      title: 'Finances',
      fields: [
        { label: 'Savings ($):', name: 'savings', type: 'number', tooltip: 'Current cash savings' },
        { label: 'Monthly Savings (Stay) ($):', name: 'monthlySavingsStay', type: 'number', tooltip: 'Monthly savings if staying in current home' },
        { label: 'Monthly Savings (Buy) ($):', name: 'monthlySavingsBuy', type: 'number', tooltip: 'Target monthly savings after buying new home' },
        { label: 'Savings Interest Rate (%):', name: 'savingsInterestRate', type: 'number', step: '0.1', tooltip: 'Annual return on savings' },
        { label: 'Monthly Income ($):', name: 'monthlyIncome', type: 'number', tooltip: 'Current monthly income' },
        { label: 'Income Growth (%):', name: 'incomeGrowthPercent', type: 'number', step: '0.1', tooltip: 'Annual income growth rate' },
        { label: 'Monthly Expenses ($):', name: 'monthlyExpenses', type: 'number', tooltip: 'Current monthly expenses' },
        { label: 'Inflation Rate (%):', name: 'inflationPercent', type: 'number', step: '0.1', tooltip: 'Annual expense inflation rate' },
        { label: 'Monthly Debt ($):', name: 'monthlyDebt', type: 'number', tooltip: 'Monthly debt payments' },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Inputs */}
      <div className="w-80 bg-gray-800 text-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Input Parameters</h2>
        {hasHeadlessUI ? (
          inputSections.map((section, idx) => (
            <div key={idx}>{renderCollapsibleInputSection(section)}</div>
          ))
        ) : (
          <>
            {inputSections.map((section, idx) => (
              <div key={idx}>{renderInputSection(section.title, section.fields)}</div>
            ))}
            <p className="text-red-400 text-sm">Note: Collapsible sections unavailable due to missing Headless UI library.</p>
          </>
        )}
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
