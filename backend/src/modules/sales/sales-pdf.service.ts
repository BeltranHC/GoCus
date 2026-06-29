// @ts-nocheck
import { Injectable } from '@nestjs/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as QRCode from 'qrcode';
// @ts-ignore
import { numeroALetras } from 'numero-a-letras';
import { Sale, SaleDetail, Customer, Company, Branch } from '@prisma/client';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any);

type FullSale = Sale & {
  details: (SaleDetail & { product: { name: string; unitId: string | null } })[];
  customer: Customer | null;
  branch: Branch & { company: Company };
  user: { firstName: string; lastName: string };
};

@Injectable()
export class SalesPdfService {
  async generateTicketPdf(sale: FullSale): Promise<Buffer> {
    const { branch, customer, details } = sale;
    const company = branch.company;

    // Generate QR Code base64
    const qrData = `${company.taxId}|${sale.documentType}|${sale.series}|${sale.correlative}|${sale.igvAmount}|${sale.total}|${sale.createdAt.toISOString().split('T')[0]}|${customer?.documentIdType || '-'}|${customer?.documentNumber || '-'}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    const amountInWords = numeroALetras(Number(sale.total), {
      plural: 'SOLES',
      singular: 'SOL',
      centPlural: 'CÉNTIMOS',
      centSingular: 'CÉNTIMO',
    });

    const docDefinition: any = {
      pageSize: { width: 226, height: 'auto' }, // 80mm roll paper
      pageMargins: [10, 10, 10, 10],
      defaultStyle: {
        fontSize: 8,
        font: 'Roboto',
      },
      content: [
        { text: company.tradeName || company.name, style: 'header', alignment: 'center' },
        { text: `RUC: ${company.taxId}`, alignment: 'center', margin: [0, 2, 0, 0] },
        { text: `${branch.name} - ${branch.address}`, alignment: 'center', margin: [0, 2, 0, 0] },
        { text: `Tel: ${branch.phone || company.phone || '-'}`, alignment: 'center', margin: [0, 2, 0, 0] },
        { text: '------------------------------------------------------------------', alignment: 'center', margin: [0, 5, 0, 5] },
        
        { text: sale.documentType.replace(/_/g, ' '), style: 'subheader', alignment: 'center', bold: true },
        { text: `${sale.series}-${sale.correlative?.toString().padStart(6, '0')}`, alignment: 'center', bold: true, fontSize: 10, margin: [0, 2, 0, 5] },
        
        { text: '------------------------------------------------------------------', alignment: 'center', margin: [0, 0, 0, 5] },
        {
          columns: [
            { text: 'FECHA:', width: 45, bold: true },
            { text: sale.createdAt.toLocaleString('es-PE', { timeZone: 'America/Lima' }) }
          ]
        },
        {
          columns: [
            { text: 'CLIENTE:', width: 45, bold: true },
            { text: customer ? `${customer.firstName} ${customer.lastName}` : 'CLIENTE VARIOS' }
          ],
          margin: [0, 2, 0, 0]
        },
        {
          columns: [
            { text: customer?.documentIdType || 'DOC:', width: 45, bold: true },
            { text: customer?.documentNumber || '00000000' }
          ],
          margin: [0, 2, 0, 5]
        },
        { text: '------------------------------------------------------------------', alignment: 'center', margin: [0, 0, 0, 5] },
        
        // Products Table
        {
          table: {
            headerRows: 1,
            widths: ['15%', '50%', '35%'],
            body: [
              [
                { text: 'CANT', bold: true },
                { text: 'DESCRIPCIÓN', bold: true },
                { text: 'TOTAL', bold: true, alignment: 'right' }
              ],
              ...details.map(d => [
                d.quantity.toString(),
                d.product.name,
                { text: Number(d.subtotal).toFixed(2), alignment: 'right' }
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
        
        { text: '------------------------------------------------------------------', alignment: 'center', margin: [0, 5, 0, 5] },
        
        // Totals
        {
          columns: [
            { text: 'GRAVADO:', bold: true, alignment: 'right', width: '70%' },
            { text: `S/ ${(Number(sale.total) - Number(sale.igvAmount)).toFixed(2)}`, alignment: 'right', width: '30%' }
          ],
          margin: [0, 2, 0, 0]
        },
        {
          columns: [
            { text: 'IGV (18%):', bold: true, alignment: 'right', width: '70%' },
            { text: `S/ ${Number(sale.igvAmount).toFixed(2)}`, alignment: 'right', width: '30%' }
          ],
          margin: [0, 2, 0, 0]
        },
        {
          columns: [
            { text: 'TOTAL A PAGAR:', bold: true, alignment: 'right', width: '70%', fontSize: 10 },
            { text: `S/ ${Number(sale.total).toFixed(2)}`, alignment: 'right', width: '30%', fontSize: 10, bold: true }
          ],
          margin: [0, 2, 0, 5]
        },
        
        { text: `SON: ${amountInWords}`, alignment: 'center', margin: [0, 5, 0, 5], fontSize: 7 },
        
        { text: '------------------------------------------------------------------', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: `CAJERO: ${sale.user.firstName} ${sale.user.lastName}`, alignment: 'center', fontSize: 7 },
        { text: `PAGO: ${sale.paymentMethod}`, alignment: 'center', fontSize: 7, margin: [0, 2, 0, 5] },
        
        {
          image: qrCodeDataUrl,
          width: 80,
          alignment: 'center',
          margin: [0, 10, 0, 5]
        },
        { text: 'Representación impresa de la Boleta Electrónica', alignment: 'center', fontSize: 6 },
        { text: 'Autorizado mediante resolución SUNAT', alignment: 'center', fontSize: 6 },
        { text: '¡Gracias por su compra!', alignment: 'center', fontSize: 8, bold: true, margin: [0, 10, 0, 0] }
      ],
      styles: {
        header: {
          fontSize: 12,
          bold: true
        },
        subheader: {
          fontSize: 10,
          bold: true
        }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        (pdfDoc as any).getBuffer((buffer: any) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
