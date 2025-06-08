import React, { useState, useContext, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AppContext } from '../../App';
import { BillingRecord, ReportPeriod, ReportData, User, Service } from '../../types';
import { REPORT_PERIOD_OPTIONS, INITIAL_USERS } from '../../constants';
import { generateReportData, exportToPdf, exportToXlsx } from '../../utils/reportingUtils';
// import { INITIAL_USERS } from '../../constants'; // Already imported

const ReportingSection: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return <p>Error: AppContext not available.</p>;

  const { billingRecords, services: allAvailableServices } = context; // services from context is allAvailableServices

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>(ReportPeriod.WEEKLY);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [serviceUsageChartData, setServiceUsageChartData] = useState<any>({ series: [], options: {} });
  const [revenueChartData, setRevenueChartData] = useState<any>({ series: [], options: {} });
  const [staffPerformanceChartData, setStaffPerformanceChartData] = useState<any>({ series: [], options: {} });


  const handleGenerateReport = () => {
    setIsLoading(true);
    // Pass INITIAL_USERS for allStaff and allAvailableServices from context
    const data = generateReportData(billingRecords, selectedPeriod, INITIAL_USERS, allAvailableServices);
    setReportData(data);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (reportData) {
      // Update Service Usage Chart
      setServiceUsageChartData({
        series: [{ name: 'Times Used', data: reportData.serviceUsage.map(s => s.count) }],
        options: {
          chart: { id: 'serviceUsageChart', type: 'bar', height: 350, toolbar: { show: true } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
          dataLabels: { enabled: false },
          stroke: { show: true, width: 2, colors: ['transparent'] },
          xaxis: { categories: reportData.serviceUsage.map(s => s.name), title: { text: 'Services' } },
          yaxis: { title: { text: 'Number of Times Used' } },
          fill: { opacity: 1 },
          tooltip: { y: { formatter: (val: number) => `${val} uses` } },
          title: { text: 'Service Usage Frequency', align: 'center' }
        },
      });

      // Update Revenue Chart
      setRevenueChartData({
        series: [{ name: 'Revenue', data: reportData.revenueOverTime.map(r => r.revenue) }],
        options: {
          chart: { id: 'revenueChart', type: 'line', height: 350, toolbar: { show: true } },
          stroke: { curve: 'smooth' },
          xaxis: { categories: reportData.revenueOverTime.map(r => r.date), title: {text: 'Date'} },
          yaxis: { title: { text: 'Revenue ($)'}, labels: { formatter: (val:number) => `$${val.toFixed(0)}`}},
          tooltip: { x: { format: 'dd MMM yy'}, y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
          title: { text: 'Revenue Over Time (Paid Services)', align: 'center' }
        },
      });

      // Update Staff Performance Chart
      // Filter out staff with 0 revenue to make chart cleaner if desired
      const activeStaffPerformance = reportData.staffPerformance.filter(s => s.totalRevenue > 0);
      setStaffPerformanceChartData({
        series: [{ name: 'Total Revenue', data: activeStaffPerformance.map(s => s.totalRevenue) }],
        options: {
          chart: { id: 'staffPerformanceChart', type: 'bar', height: 350 + (activeStaffPerformance.length > 5 ? activeStaffPerformance.length * 10 : 0) , toolbar: { show: true } },
          xaxis: { categories: activeStaffPerformance.map(s => s.staffName), title: { text: 'Staff Members' } },
          yaxis: { title: { text: 'Revenue Generated ($)' }, labels: { formatter: (val:number) => `$${val.toFixed(0)}`} },
          plotOptions: { bar: { horizontal: true } },
          tooltip: { y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
          title: { text: 'Staff Performance (by Revenue)', align: 'center' }
        },
      });
    }
  }, [reportData]);


  const handleExportPdf = async () => {
    if (!reportData) return;
    setIsLoading(true);
    try {
      await exportToPdf(reportData);
    } catch (error) {
        console.error("PDF Export failed:", error);
        alert("Failed to export PDF. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleExportXlsx = () => {
    if (!reportData) return;
    setIsLoading(true);
    try {
        exportToXlsx(reportData, INITIAL_USERS); // Pass INITIAL_USERS for staff names in Excel
    } catch (error) {
        console.error("Excel Export failed:", error);
        alert("Failed to export Excel. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Reporting System</h3>
      
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div>
          <label htmlFor="reportPeriod" className="block text-sm font-medium text-gray-700 mr-2">Select Report Period:</label>
          <select
            id="reportPeriod"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
            className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm"
          >
            {REPORT_PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          )}
          <span>{isLoading ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>

      {reportData && !isLoading && (
        <div className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-sky-50 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-sky-700">Total Revenue (Paid)</h4>
              <p className="text-3xl font-bold text-sky-600">${reportData.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-green-700">Total Washes (Paid)</h4>
              <p className="text-3xl font-bold text-green-600">{reportData.totalWashes}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {serviceUsageChartData.series.length > 0 && serviceUsageChartData.series[0].data.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <ReactApexChart options={serviceUsageChartData.options} series={serviceUsageChartData.series} type="bar" height={350} />
                </div>
            ) : <p className="text-gray-500 text-center col-span-full lg:col-span-1 py-4">No service usage data for this period.</p>}

            {revenueChartData.series.length > 0 && revenueChartData.series[0].data.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <ReactApexChart options={revenueChartData.options} series={revenueChartData.series} type="line" height={350} />
                </div>
            ) : <p className="text-gray-500 text-center col-span-full lg:col-span-1 py-4">No revenue data over time for this period.</p>}
          </div>
          
          {/* Ensure staffPerformanceChartData.options is defined before rendering */}
          {staffPerformanceChartData.series.length > 0 && staffPerformanceChartData.series[0].data.length > 0 && staffPerformanceChartData.options?.chart ? (
            <div className="bg-gray-50 p-4 rounded-lg shadow">
                 <ReactApexChart options={staffPerformanceChartData.options} series={staffPerformanceChartData.series} type="bar" height={staffPerformanceChartData.options.chart.height} />
            </div>
          ) : <p className="text-gray-500 text-center py-4">No staff performance data for this period.</p>}


          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              onClick={handleExportPdf}
              disabled={isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Export to PDF</span>
            </button>
            <button
              onClick={handleExportXlsx}
              disabled={isLoading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 17.25v.008c.085.004.17.008.255.008h4.99c.085 0 .17-.004.255-.008v-.008K4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <span>Export to Excel</span>
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="text-center py-10">
          <svg className="animate-spin h-8 w-8 text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Generating report data...</p>
        </div>
      )}
      {!reportData && !isLoading && (
        <p className="text-center text-gray-500 py-10">Select a period and click "Generate Report" to view data.</p>
      )}
    </div>
  );
};

export default ReportingSection;