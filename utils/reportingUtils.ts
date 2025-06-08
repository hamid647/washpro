import { BillingRecord, ReportPeriod, ReportData, ServiceUsageData, StaffPerformanceData, User, PaymentStatus, RevenueDataPoint, Service } from '../types';
import jsPDF from 'jspdf';
// import 'jspdf-autotable'; // Old side-effect import
import autoTable from 'jspdf-autotable'; // Import autoTable function directly
import *XLSX from 'xlsx';
import ApexCharts from 'apexcharts';

async function getChartAsBase64(chartElementId: string): Promise<string | null> {
  return new Promise((resolve) => {
    // Defer the execution slightly to give ApexCharts more time to initialize/render.
    setTimeout(async () => {
      try {
        const chartComponent = document.querySelector(`#${chartElementId}`);
        // Ensure ApexCharts and its exec method are available globally
        if (!chartComponent || !window.ApexCharts || typeof window.ApexCharts.exec !== 'function') {
          console.warn(`Chart element #${chartElementId} not found in DOM, or ApexCharts.exec not available globally.`);
          resolve(null);
          return;
        }

        const result: { imgURI?: string } | undefined = await window.ApexCharts.exec(chartElementId, 'dataURI');
        if (result && result.imgURI) {
          resolve(result.imgURI);
        } else {
          console.warn(`Chart data URI not found for ${chartElementId} via ApexCharts.exec. Result:`, result);
          resolve(null);
        }
      } catch (error) {
        console.error(`Error getting chart data URI for ${chartElementId} via ApexCharts.exec:`, error);
        resolve(null);
      }
    }, 200); // Increased delay slightly, adjust if necessary
  });
}


export const generateReportData = (
  allBillingRecords: BillingRecord[],
  period: ReportPeriod,
  allStaff: User[], 
  allServices: Service[] 
): ReportData => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (period) {
    case ReportPeriod.DAILY:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case ReportPeriod.WEEKLY:
      startDate.setDate(endDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case ReportPeriod.MONTHLY:
      startDate.setDate(endDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  const filteredRecords = allBillingRecords.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= startDate && recordDate <= endDate && record.paymentStatus === PaymentStatus.PAID;
  });

  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const totalWashes = filteredRecords.length;

  const serviceUsageMap: Map<string, { count: number; revenue: number; name: string }> = new Map();
  filteredRecords.forEach(record => {
    record.services.forEach(serviceInRecord => {
      const existing = serviceUsageMap.get(serviceInRecord.id) || { count: 0, revenue: 0, name: serviceInRecord.name };
      existing.count++;
      existing.revenue += serviceInRecord.price; 
      serviceUsageMap.set(serviceInRecord.id, existing);
    });
  });
  const serviceUsage: ServiceUsageData[] = Array.from(serviceUsageMap.values()).sort((a,b) => b.count - a.count);
  
  const revenueOverTime: RevenueDataPoint[] = [];
  if (filteredRecords.length > 0) {
     const dailyRevenue: { [key: string]: number } = {};
     filteredRecords.forEach(record => {
        const dateStr = new Date(record.timestamp).toLocaleDateString(); 
        dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + record.totalAmount;
     });
     for (const date in dailyRevenue) {
        revenueOverTime.push({ date, revenue: dailyRevenue[date]});
     }
     revenueOverTime.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }


  const staffPerformanceMap: Map<string, { staffName: string; washesCount: number; totalRevenue: number }> = new Map();
  allStaff.filter(s => s.role === 'STAFF').forEach(staff => {
    staffPerformanceMap.set(staff.id, { staffName: staff.name, washesCount: 0, totalRevenue: 0 });
  });

  filteredRecords.forEach(record => {
    const staffId = record.staffId;
    const staffDetails = staffPerformanceMap.get(staffId);
    if (staffDetails) { 
      staffDetails.washesCount++;
      staffDetails.totalRevenue += record.totalAmount;
    } else {
        const historicalStaffMember = allStaff.find(s => s.id === staffId); 
        const staffName = historicalStaffMember ? historicalStaffMember.name : `Unknown/Deleted Staff (ID: ${staffId.substring(0,6)})`;
        const existingUnknown = staffPerformanceMap.get(staffId) || { staffName: staffName, washesCount: 0, totalRevenue: 0 };
        existingUnknown.washesCount++;
        existingUnknown.totalRevenue += record.totalAmount;
        staffPerformanceMap.set(staffId, existingUnknown);
    }
  });
  const staffPerformance: StaffPerformanceData[] = Array.from(staffPerformanceMap.entries())
    .map(([staffId, data]) => ({ staffId, ...data }))
    .sort((a,b) => b.totalRevenue - a.totalRevenue);


  return {
    period,
    startDate,
    endDate,
    filteredRecords,
    totalRevenue,
    totalWashes,
    serviceUsage,
    revenueOverTime,
    staffPerformance,
  };
};

export const exportToPdf = async (reportData: ReportData) => {
  const doc = new jsPDF(); 
  const { period, startDate, endDate, totalRevenue, totalWashes, serviceUsage, staffPerformance, filteredRecords, revenueOverTime } = reportData;

  doc.setFontSize(18);
  doc.text(`WashPro Admin Report: ${period}`, 14, 20);
  doc.setFontSize(11);
  doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 30);

  doc.setFontSize(12);
  doc.text("Summary:", 14, 45);
  autoTable(doc, { 
    startY: 50,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
      ['Total Washes (Paid)', totalWashes.toString()],
    ],
    theme: 'striped',
    styles: { fontSize: 10 },
  });
  
  let currentY = (doc as any).lastAutoTable.finalY + 10;

  const charts = [
    { id: 'serviceUsageChart', title: 'Service Usage', hasData: serviceUsage.length > 0 },
    { id: 'revenueChart', title: 'Revenue Over Time', hasData: revenueOverTime.length > 0 },
    { id: 'staffPerformanceChart', title: 'Staff Performance (Revenue)', hasData: staffPerformance.some(s => s.totalRevenue > 0) },
  ];

  for (const chartInfo of charts) {
    if (currentY > 220) { 
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(14);
    doc.text(chartInfo.title, 14, currentY);
    currentY += 7;
    
    let chartImgData: string | null = null;
    if (chartInfo.hasData) { 
        chartImgData = await getChartAsBase64(chartInfo.id);
    }

    if (chartImgData) {
      try {
        const imgProps = doc.getImageProperties(chartImgData);
        const pdfPageWidth = doc.internal.pageSize.getWidth() - 30; 
        let imgWidth = imgProps.width;
        let imgHeight = imgProps.height;
        const aspect = imgHeight / imgWidth;

        if (imgWidth > pdfPageWidth) {
          imgWidth = pdfPageWidth;
          imgHeight = imgWidth * aspect;
        }
        
        const maxImgHeight = 70; 
        if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
            imgWidth = imgHeight / aspect;
        }

        doc.addImage(chartImgData, 'PNG', 15, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (e) {
        console.error("Error adding image to PDF:", e);
        doc.setFontSize(10);
        doc.setTextColor(255,0,0);
        doc.text(`Could not embed chart: ${chartInfo.title}.`, 15, currentY);
        doc.setTextColor(0,0,0);
        currentY += 10;
      }
    } else {
       doc.setFontSize(10);
       doc.text(`Chart data for "${chartInfo.title}" is not available or chart not rendered.`, 15, currentY);
       currentY += 10;
    }
  }


  if (currentY > 250 || (currentY > 20 && serviceUsage.length > 0 && (doc.internal.pageSize.getHeight() - currentY < 50) )) { doc.addPage(); currentY = 20;}
  if (serviceUsage.length > 0) {
    doc.setFontSize(14);
    doc.text("Service Usage Details", 14, currentY);
    currentY += 5;
    autoTable(doc, {
        startY: currentY,
        head: [['Service Name', 'Times Used', 'Revenue Generated']],
        body: serviceUsage.map(s => [s.name, s.count, `$${s.revenue.toFixed(2)}`]),
        theme: 'grid', styles: { fontSize: 9 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }


  if (currentY > 250 || (currentY > 20 && staffPerformance.length > 0 && (doc.internal.pageSize.getHeight() - currentY < 50) )) { doc.addPage(); currentY = 20;}
  if (staffPerformance.filter(s => s.washesCount > 0).length > 0) { 
    doc.setFontSize(14);
    doc.text("Staff Performance Details", 14, currentY);
    currentY += 5;
    autoTable(doc, {
        startY: currentY,
        head: [['Staff Name', 'Washes Handled', 'Revenue Generated']],
        body: staffPerformance.filter(s => s.washesCount > 0).map(s => [s.staffName, s.washesCount, `$${s.totalRevenue.toFixed(2)}`]),
        theme: 'grid', styles: { fontSize: 9 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  if (filteredRecords.length > 0) {
    if (currentY > 250 || (currentY > 20 && (doc.internal.pageSize.getHeight() - currentY < 50) )) { doc.addPage(); currentY = 20;}
    doc.setFontSize(14);
    doc.text("Detailed Paid Transactions (Sample)", 14, currentY);
    currentY += 5;
    autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Customer', 'Car', 'Services', 'Amount']],
        body: filteredRecords.slice(0, 30).map(r => [
            new Date(r.timestamp).toLocaleDateString(),
            r.customerName,
            r.carDetails,
            r.services.map(s => s.name).join(', '),
            `$${r.totalAmount.toFixed(2)}`
        ]),
        theme: 'grid', styles: { fontSize: 8 },
        didDrawPage: function (data: any) { 
            currentY = data.cursor.y + 10;
        }
    });
  }

  doc.save(`WashPro_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToXlsx = (reportData: ReportData, allStaff: User[]) => {
  const { period, startDate, endDate, totalRevenue, totalWashes, serviceUsage, staffPerformance, filteredRecords, revenueOverTime } = reportData;

  const wb = XLSX.utils.book_new();

  const summaryData = [
    { Metric: "Report Period", Value: period },
    { Metric: "Start Date", Value: startDate.toLocaleDateString() },
    { Metric: "End Date", Value: endDate.toLocaleDateString() },
    { Metric: "Total Revenue (Paid)", Value: totalRevenue },
    { Metric: "Total Washes (Paid)", Value: totalWashes },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  const recordsForSheet = filteredRecords.map(r => ({
    ID: r.id,
    Date: new Date(r.timestamp).toLocaleString(),
    Customer: r.customerName,
    CarDetails: r.carDetails,
    Services: r.services.map(s => s.name).join('; '),
    TotalAmount: r.totalAmount,
    PaymentStatus: r.paymentStatus,
    StaffName: allStaff.find(s => s.id === r.staffId)?.name || r.staffId,
    Notes: r.notes || '',
  }));
  const recordsWs = XLSX.utils.json_to_sheet(recordsForSheet);
  XLSX.utils.book_append_sheet(wb, recordsWs, "Paid Transactions");
  
  if (serviceUsage.length > 0) {
    const serviceUsageForSheet = serviceUsage.map(s => ({
        ServiceName: s.name,
        TimesUsed: s.count,
        RevenueGenerated: s.revenue,
    }));
    const serviceUsageWs = XLSX.utils.json_to_sheet(serviceUsageForSheet);
    XLSX.utils.book_append_sheet(wb, serviceUsageWs, "Service Usage");
  }

  if (staffPerformance.filter(s => s.washesCount > 0).length > 0) {
    const staffPerformanceForSheet = staffPerformance.filter(s => s.washesCount > 0).map(s => ({
        StaffName: s.staffName,
        WashesHandled: s.washesCount,
        RevenueGenerated: s.totalRevenue,
    }));
    const staffPerformanceWs = XLSX.utils.json_to_sheet(staffPerformanceForSheet);
    XLSX.utils.book_append_sheet(wb, staffPerformanceWs, "Staff Performance");
  }
  
   if (revenueOverTime.length > 0) {
    const revenueWs = XLSX.utils.json_to_sheet(revenueOverTime);
    XLSX.utils.book_append_sheet(wb, revenueWs, "Revenue Over Time");
  }

  XLSX.writeFile(wb, `WashPro_Report_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
