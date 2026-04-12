
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

export const downloadTicket = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  let wrapper: HTMLDivElement | null = null;

  try {
    wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.padding = '24px';
    wrapper.style.background = '#ffffff';
    wrapper.style.zIndex = '-1';

    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.style.width = `${element.scrollWidth}px`;
    clone.style.maxWidth = 'none';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
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

    const { width, height } = clone.getBoundingClientRect();
    const captureWidth = Math.ceil(width || clone.scrollWidth || element.scrollWidth);
    const captureHeight = Math.ceil(height || clone.scrollHeight || element.scrollHeight);

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

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
};
