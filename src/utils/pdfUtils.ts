
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadTicket = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temporarily hide elements with 'no-print' class
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach((el: any) => el.style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Restore elements
    noPrintElements.forEach((el: any) => el.style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
