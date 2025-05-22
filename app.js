import React, { useState, useEffect, useCallback } from 'react';

// Icone SVG semplici per un tocco visuale
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008 كذلكZm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm.375-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-6.75h.008v.008H11.25v-.008Zm0 2.25h.008v.008H11.25v-.008Zm0 2.25h.008v.008H11.25v-.008Zm0 2.25h.008v.008H11.25v-.008Zm2.25-6.75h.008v.008H13.5v-.008Zm0 2.25h.008v.008H13.5v-.008Zm0 2.25h.008v.008H13.5v-.008Zm0 2.25h.008v.008H13.5v-.008Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 19.875v-6.75ZM19.5 0c.621 0 1.125.504 1.125 1.125v4.5A1.125 1.125 0 0 1 19.5 6.75H4.5A1.125 1.125 0 0 1 3.375 5.625v-4.5C3.375.504 3.879 0 4.5 0h15Z" />
  </svg>
);

const EuroIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

// Funzione helper per formattare i numeri come valuta
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "€ 0,00";
  return `€ ${num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Funzione di calcolo principale
// Questa funzione è separata per facilitare i test unitari.
export const calculateRoyaltiesLogic = (inputs) => {
  const {
    netRevenueStandard, // Fatturato Netto Prodotti Standard (base per royalty 2%)
    netRevenueATD,
    netRevenueALX,
    netRevenueEB,
    netRevenueAMZ,
    vatRate // Aliquota IVA (es. 0.22 per 22%)
  } = inputs;

  const cleanStandard = parseFloat(netRevenueStandard) || 0;
  const cleanATD = parseFloat(netRevenueATD) || 0;
  const cleanALX = parseFloat(netRevenueALX) || 0;
  const cleanEB = parseFloat(netRevenueEB) || 0;
  const cleanAMZ = parseFloat(netRevenueAMZ) || 0;
  const cleanVatRate = parseFloat(vatRate) || 0;

  const royaltiesOnStandard = cleanStandard * 0.02;
  const totalNetSpecialCodes = cleanATD + cleanALX + cleanEB + cleanAMZ;
  const royaltiesOnSpecialCodes = totalNetSpecialCodes * 0.10;
  const totalRoyalties = royaltiesOnStandard + royaltiesOnSpecialCodes;

  // Calcoli derivati per completezza
  const grossRevenueStandard = cleanStandard * (1 + cleanVatRate);
  const totalGrossSpecialCodes = totalNetSpecialCodes * (1 + cleanVatRate);
  const totalGrossRevenue = grossRevenueStandard + totalGrossSpecialCodes;
  const totalNetRevenue = cleanStandard + totalNetSpecialCodes;
  
  return {
    royaltiesOnStandard,
    totalNetSpecialCodes,
    royaltiesOnSpecialCodes,
    totalRoyalties,
    grossRevenueStandard,
    totalGrossSpecialCodes,
    totalGrossRevenue,
    totalNetRevenue,
    // Valori originali del CSV per confronto (se necessario in futuro)
    // Questi erano i valori del CSV fornito:
    // Fatturato Lordo (€): € 130.000,00 -> Questo sarebbe il totalGrossRevenue se gli input corrispondono
    // Fatturato Senza Codici ATD-ALX-EB-AMZ (€): € 128.496,00 -> Questo sarebbe grossRevenueStandard
    // Fatturato netto (scorporato di IVA): € 105.324,59 -> Questo sarebbe totalNetRevenue
    // Fatturato Netto Senza Codici Speciali (€): € 103.820,59 -> Questo sarebbe netRevenueStandard
    // Totale Royalties (2% del Fatturato Netto) (€): € 2.076,41 -> royaltiesOnStandard
    // Fatturato Codici ATD-ALX-EB-AMZ Netto (€): € 1.504,00 -> totalNetSpecialCodes
    // Totale Royalties Codici Speciali (10% del Fatturato Netto) (€): € 150,40 -> royaltiesOnSpecialCodes
    // totale royalties: € 2.226,81 -> totalRoyalties
  };
};


function App() {
  // Stato per gli input del form
  const [inputs, setInputs] = useState({
    netRevenueStandard: '103820.59', // Fatturato Netto Prodotti Standard (base per royalty 2%)
    netRevenueATD: '115.00',
    netRevenueALX: '239.00',
    netRevenueEB: '1035.00',
    netRevenueAMZ: '115.00',
    vatRate: '0.22' // Aliquota IVA (es. 0.22 per 22%)
  });

  // Stato per i risultati calcolati
  const [results, setResults] = useState(calculateRoyaltiesLogic(inputs));

  // Gestore per l'aggiornamento degli input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  // Ricalcola i risultati quando gli input cambiano
  useEffect(() => {
    setResults(calculateRoyaltiesLogic(inputs));
  }, [inputs]);

  // Definisce i campi di input per il form
  const inputFields = [
    { name: 'netRevenueStandard', label: 'Fatturato Netto Prodotti Standard (€)', placeholder: 'Es. 103820.59' },
    { name: 'netRevenueATD', label: 'Fatturato Netto Codice ATD (€)', placeholder: 'Es. 115.00' },
    { name: 'netRevenueALX', label: 'Fatturato Netto Codice ALX (€)', placeholder: 'Es. 239.00' },
    { name: 'netRevenueEB', label: 'Fatturato Netto Codice EB (€)', placeholder: 'Es. 1035.00' },
    { name: 'netRevenueAMZ', label: 'Fatturato Netto Codice AMZ (€)', placeholder: 'Es. 115.00' },
    { name: 'vatRate', label: 'Aliquota IVA (es. 0.22 per 22%)', placeholder: 'Es. 0.22' },
  ];

  // Definisce i campi dei risultati da visualizzare
  const resultFields = [
    { label: 'Royalties su Prodotti Standard (2%)', value: results.royaltiesOnStandard },
    { label: 'Totale Fatturato Netto Codici Speciali', value: results.totalNetSpecialCodes },
    { label: 'Royalties su Codici Speciali (10%)', value: results.royaltiesOnSpecialCodes },
    { label: 'Fatturato Netto Complessivo', value: results.totalNetRevenue, isEmphasized: false, className: "mt-2 pt-2 border-t border-gray-200" },
    { label: 'Fatturato Lordo Prodotti Standard (Stimato)', value: results.grossRevenueStandard, className: "mt-2 pt-2 border-t border-gray-200" },
    { label: 'Totale Fatturato Lordo Codici Speciali (Stimato)', value: results.totalGrossSpecialCodes },
    { label: 'Fatturato Lordo Complessivo (Stimato)', value: results.totalGrossRevenue, isEmphasized: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-8 flex flex-col items-center font-sans">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 flex items-center justify-center">
          <CalculatorIcon /> Calcolatore Royalties
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Inserisci i dati per calcolare le royalties e i relativi importi.</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sezione Input */}
        <section className="bg-slate-800 shadow-2xl rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-sky-400">Dati di Input</h2>
          <form className="space-y-4">
            {inputFields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {field.name !== 'vatRate' && <EuroIcon />}
                  </div>
                  <input
                    type="number"
                    name={field.name}
                    id={field.name}
                    value={inputs[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    step="0.01" // Permette decimali
                    className={`w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-white transition-colors duration-150 ease-in-out ${field.name !== 'vatRate' ? 'pl-10' : 'pl-3'}`}
                  />
                </div>
              </div>
            ))}
          </form>
        </section>

        {/* Sezione Risultati */}
        <section className="bg-slate-800 shadow-2xl rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-teal-400">Risultati Calcolati</h2>
          <div className="space-y-3">
            {resultFields.map(resField => (
              <div key={resField.label} className={`flex justify-between items-center p-3 bg-slate-700/50 rounded-lg ${resField.className || ''}`}>
                <span className="text-slate-300">{resField.label}:</span>
                <span className={`font-semibold text-lg ${resField.isEmphasized ? 'text-sky-300' : 'text-white'}`}>
                  {formatCurrency(resField.value)}
                </span>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t-2 border-sky-500/50 flex justify-between items-center">
              <span className="text-xl font-bold text-sky-300">TOTALE ROYALTIES:</span>
              <span className="text-2xl font-bold text-sky-300 bg-slate-700 px-3 py-1 rounded-md">
                {formatCurrency(results.totalRoyalties)}
              </span>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="w-full max-w-4xl mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Calcolatore Royalties. Sviluppato con passione.</p>
        <p className="mt-1">Questa è una web app dimostrativa. Verifica sempre i calcoli per usi ufficiali.</p>
      </footer>
    </div>
  );
}

export default App;

/**
 * Per eseguire questa applicazione:
 * 1. Assicurati di avere Node.js e npm (o yarn) installati.
 * 2. Crea un nuovo progetto React: `npx create-react-app royalties-calculator`
 * 3. Naviga nella directory: `cd royalties-calculator`
 * 4. Installa Tailwind CSS:
 * `npm install -D tailwindcss postcss autoprefixer`
 * `npx tailwindcss init -p`
 * 5. Configura Tailwind nel file `tailwind.config.js`:
 * module.exports = {
 * content: [
 * "./src/**\/*.{js,jsx,ts,tsx}",
 * ],
 * theme: {
 * extend: {
 * fontFamily: {
 * sans: ['Inter', 'sans-serif'], // Esempio di font, assicurati sia importato
 * },
 * },
 * },
 * plugins: [],
 * }
 * 6. Includi le direttive Tailwind nel tuo file CSS principale (es. `src/index.css` o `src/App.css`):
 * @tailwind base;
 * @tailwind components;
 * @tailwind utilities;
 * 7. Sostituisci il contenuto di `src/App.js` con il codice qui sopra.
 * 8. Avvia l'app: `npm start` (o `yarn start`)
 *
 * Per i font (come Inter), puoi importarli nel tuo file CSS principale o index.html:
 * Esempio per index.html:
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
 * E assicurati che il body nel CSS abbia `font-family: 'Inter', sans-serif;` o configuralo in Tailwind.
 */

