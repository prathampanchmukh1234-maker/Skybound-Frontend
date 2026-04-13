import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const waitForImageLoad = async (image: HTMLImageElement) => {
  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  try {
    await image.decode();
    return;
  } catch {
    await new Promise<void>((resolve) => {
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
        resolve();
      };

      image.onload = cleanup;
      image.onerror = cleanup;
    });
  }
};

const createExportClone = async (element: HTMLElement) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.padding = '24px';
  wrapper.style.background = '#ffffff';
  wrapper.style.zIndex = '-1';
  wrapper.style.width = `${Math.max(element.scrollWidth, 960)}px`;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.width = '100%';
  clone.style.maxWidth = 'none';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.overflowY = 'visible';
  clone.style.transform = 'none';
  clone.style.animation = 'none';

  clone.querySelectorAll('.no-print').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  if ('fonts' in document) {
    await (document as any).fonts.ready;
  }

  const clonedImages = Array.from(clone.querySelectorAll('img'));
  await Promise.all(clonedImages.map(waitForImageLoad));

  return {
    wrapper,
    clone
  };
};

export const downloadTicket = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  let wrapper: HTMLDivElement | null = null;

  try {
    const prepared = await createExportClone(element);
    wrapper = prepared.wrapper;
    const clone = prepared.clone;

    const captureWidth = Math.ceil(clone.scrollWidth || clone.getBoundingClientRect().width || element.scrollWidth);
    const captureHeight = Math.ceil(clone.scrollHeight || clone.getBoundingClientRect().height || element.scrollHeight);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageHeightInCanvasPx = Math.floor(canvas.width * (pageHeight / pageWidth));
    const sliceCanvas = document.createElement('canvas');
    const sliceContext = sliceCanvas.getContext('2d');

    if (!sliceContext) {
      throw new Error('Unable to prepare ticket PDF pages.');
    }

    let renderedHeight = 0;
    let isFirstPage = true;

    while (renderedHeight < canvas.height) {
      const remainingHeight = canvas.height - renderedHeight;
      const sliceHeight = Math.min(pageHeightInCanvasPx, remainingHeight);

      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      sliceContext.fillStyle = '#ffffff';
      sliceContext.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceContext.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const pageImage = sliceCanvas.toDataURL('image/png');
      const renderedPageHeight = (sliceHeight * pageWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(pageImage, 'PNG', 0, 0, pageWidth, renderedPageHeight, undefined, 'FAST');
      renderedHeight += sliceHeight;
      isFirstPage = false;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
};

export const printTicket = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  let wrapper: HTMLDivElement | null = null;

  try {
    const prepared = await createExportClone(element);
    wrapper = prepared.wrapper;
    const clone = prepared.clone;
    const printWindow = window.open('', '_blank', 'width=1100,height=900');

    if (!printWindow) {
      throw new Error('Unable to open print preview.');
    }

    const printMarkup = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Ticket Print</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 24px;
              background: #ffffff;
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            img {
              max-width: 100%;
              display: block;
            }
            .ticket-print-shell {
              width: 100%;
              max-width: 960px;
              margin: 0 auto;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-print-shell">${clone.outerHTML}</div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printMarkup);
    printWindow.document.close();

    const printImages = Array.from(printWindow.document.images);
    await Promise.all(printImages.map(waitForImageLoad));

    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error('Error printing ticket:', error);
  } finally {
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
};
