import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { Sale, SaleDetail, Customer, Company, Branch } from '@prisma/client';
import * as path from 'path';

// Roboto font definitions for pdfmake v0.3.x
const fontsDir = path.join(
  path.dirname(require.resolve('pdfmake/package.json')),
  'build',
  'fonts',
  'Roboto',
);

const fonts = {
  Roboto: {
    normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
    bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
    italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
    bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
  },
};

type FullSale = Sale & {
  details: (SaleDetail & { product: { name: string; unit: { abbreviation: string } | null } })[];
  customer: Customer | null;
  branch: Branch & { company: Company };
  user: { firstName: string; lastName: string };
};

@Injectable()
export class SalesPdfService {
  private readonly logger = new Logger(SalesPdfService.name);

  /**
   * Converts amount to words in Spanish.
   * Uses a simple implementation to avoid dependency issues with numero-a-letras.
   */
  private amountToWords(amount: number): string {
    try {
      // Try the npm package first
      const { numeroALetras } = require('numero-a-letras');
      return numeroALetras(amount, {
        plural: 'SOLES',
        singular: 'SOL',
        centPlural: 'CÉNTIMOS',
        centSingular: 'CÉNTIMO',
      });
    } catch {
      // Fallback: simple representation
      const intPart = Math.floor(amount);
      const decPart = Math.round((amount - intPart) * 100);
      return `${intPart} CON ${decPart.toString().padStart(2, '0')}/100 SOLES`;
    }
  }

  async generateTicketPdf(sale: FullSale): Promise<Buffer> {
    const { branch, customer, details } = sale;
    const company = branch.company;

    // Generate QR Code base64
    const qrData = [
      company.taxId || '-',
      sale.documentType,
      sale.series || '-',
      sale.correlative?.toString() || '-',
      Number(sale.igvAmount).toFixed(2),
      Number(sale.total).toFixed(2),
      sale.createdAt.toISOString().split('T')[0],
      customer?.documentIdType || '-',
      customer?.documentNumber || '-',
    ].join('|');

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    const amountInWords = this.amountToWords(Number(sale.total));
    const saleCorrelative = (sale.correlative ?? 0).toString().padStart(7, '0');
    const docTypeLabel = sale.documentType === 'BOLETA' ? 'BOLETA DE VENTA\nELECTRÓNICA' : 'FACTURA\nELECTRÓNICA';

    // Resolve Logo
    let logoImage = null;
    try {
      const fs = require('fs');
      const logoPath = path.join(process.cwd(), 'assets', 'logo.png');
      if (fs.existsSync(logoPath)) {
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        logoImage = `data:image/png;base64,${logoBase64}`;
      }
    } catch (e) {
      this.logger.warn('Could not load logo.png from assets');
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      defaultStyle: {
        fontSize: 9,
      },
      content: [
        // ── HEADER ──
        {
          columns: [
            // Left Column (Logo + Company Details)
            {
              width: '60%',
              columns: [
                ...(logoImage ? [{ image: logoImage, width: 80, margin: [0, 0, 10, 0] }] : []),
                {
                  stack: [
                    { text: company.name || 'CORPORACION CUSCOGO S.A.C', fontSize: 13, bold: true, margin: [0, 0, 0, 5] },
                    { text: `${branch.address || 'CUSCOGO JULIACA » JR. HUANCANE N° 537'}`, fontSize: 9 },
                    { text: `CEL: ${company.phone || branch.phone || '-'}`, fontSize: 9, margin: [0, 5, 0, 0] },
                    { text: `CORREO ELECTRONICO: ${company.email || '-'}`, fontSize: 9 },
                    { text: `WEB: https://www.cuscogo.com/`, fontSize: 9 },
                  ]
                }
              ]
            },
            // Right Column (RUC & Document Type)
            {
              width: '40%',
              table: {
                widths: ['*'],
                body: [
                  [{ text: `RUC ${company.taxId || '-'}`, alignment: 'center', fontSize: 14, margin: [0, 5] }],
                  [{ text: docTypeLabel, alignment: 'center', fontSize: 14, bold: true, fillColor: '#eeeeee', margin: [0, 5] }],
                  [{ text: `${sale.series || '-'}-${saleCorrelative}`, alignment: 'center', fontSize: 14, margin: [0, 5] }]
                ]
              },
              layout: {
                hLineWidth: function () { return 1; },
                vLineWidth: function () { return 1; },
                hLineColor: function () { return '#000000'; },
                vLineColor: function () { return '#000000'; },
              }
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // ── CUSTOMER DATA ──
        {
          columns: [
            {
              width: '65%',
              stack: [
                {
                  columns: [
                    { text: 'DOCUMENTO', bold: true, width: 80 },
                    { text: `${customer?.documentIdType || 'DNI'} ${customer?.documentNumber || '-'}`, width: '*' }
                  ]
                },
                {
                  columns: [
                    { text: 'CLIENTE', bold: true, width: 80 },
                    { text: customer ? `${customer.firstName} ${customer.lastName}` : 'CLIENTE VARIOS', width: '*' }
                  ],
                  margin: [0, 2, 0, 0]
                },
                {
                  columns: [
                    { text: 'DIRECCIÓN', bold: true, width: 80 },
                    { text: customer?.address || 'SIN DIRECCIÓN', width: '*' }
                  ],
                  margin: [0, 2, 0, 0]
                }
              ]
            },
            {
              width: '35%',
              stack: [
                {
                  columns: [
                    { text: 'FECHA EMISIÓN', bold: true, width: 120 },
                    { text: sale.createdAt.toLocaleDateString('es-PE', { timeZone: 'America/Lima' }), width: '*' }
                  ]
                },
                {
                  columns: [
                    { text: 'FECHA VENCIMIENTO', bold: true, width: 120 },
                    { text: '-', width: '*' }
                  ],
                  margin: [0, 2, 0, 0]
                },
                {
                  columns: [
                    { text: 'MONEDA', bold: true, width: 120 },
                    { text: 'SOLES', width: '*' }
                  ],
                  margin: [0, 2, 0, 0]
                }
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },

        // ── ITEMS TABLE ──
        {
          table: {
            headerRows: 1,
            widths: [20, 60, '*', 40, 50, 45, 55],
            body: [
              [
                { text: 'Nº', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
                { text: 'UNIDAD', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
                { text: 'DESCRIPCIÓN', bold: true, fillColor: '#000000', color: '#ffffff', margin: [0, 2] },
                { text: 'CANT.', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
                { text: 'P. UNIT.', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
                { text: 'DSCTO', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
                { text: 'TOTAL', bold: true, fillColor: '#000000', color: '#ffffff', alignment: 'center', margin: [0, 2] },
              ],
              ...details.map((d, i) => [
                { text: (i + 1).toString(), alignment: 'center' },
                { text: d.product.unit?.abbreviation?.toUpperCase() || 'UNIDADES', alignment: 'center' },
                { text: d.product.name },
                { text: Number(d.quantity).toFixed(2), alignment: 'center' },
                { text: Number(d.unitPrice).toFixed(2), alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: Number(d.subtotal).toFixed(2), alignment: 'right' },
              ])
            ]
          },
          layout: {
            hLineWidth: function (i: number, node: any) { return (i === 0 || i === node.table.body.length) ? 1 : 0; },
            vLineWidth: function () { return 1; },
            hLineColor: function () { return '#000000'; },
            vLineColor: function () { return '#000000'; },
            paddingTop: function (i: number) { return i === 0 ? 2 : 5; },
            paddingBottom: function (i: number) { return i === 0 ? 2 : 5; },
          },
          margin: [0, 0, 0, 0]
        },

        // ── TOTALS ──
        {
          table: {
            widths: ['*', 100, 55],
            body: [
              [
                { text: `SON ${amountInWords}`, colSpan: 3, alignment: 'center', border: [1, 1, 1, 1], margin: [0, 2] },
                {}, {}
              ],
              [
                { text: '', border: [0, 0, 0, 0] },
                { text: 'GRAVADO', bold: true, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] },
                { text: `S/ ${(Number(sale.total) - Number(sale.igvAmount)).toFixed(2)}`, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] }
              ],
              [
                { text: '', border: [0, 0, 0, 0] },
                { text: 'I.G.V. 18%', bold: true, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] },
                { text: `S/ ${Number(sale.igvAmount).toFixed(2)}`, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] }
              ],
              [
                { text: '', border: [0, 0, 0, 0] },
                { text: 'TOTAL', bold: true, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] },
                { text: `S/ ${Number(sale.total).toFixed(2)}`, bold: true, alignment: 'right', border: [0, 0, 0, 0], margin: [0, 2] }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          },
          margin: [0, 0, 0, 20]
        },

        // ── FOOTER DETAILS ──
        {
          columns: [
            {
              width: '75%',
              stack: [
                {
                  columns: [
                    { text: 'USUARIO', bold: true, width: 150 },
                    { text: `${sale.user.firstName} ${sale.user.lastName} - ${sale.createdAt.toLocaleString('es-PE', { timeZone: 'America/Lima' })}`, width: '*' }
                  ],
                  margin: [0, 0, 0, 3]
                },
                {
                  columns: [
                    { text: 'CONDICIÓN DE PAGO', bold: true, width: 150 },
                    { text: sale.paymentMethod === 'CASH' ? 'CONTADO' : sale.paymentMethod, width: '*' }
                  ],
                  margin: [0, 0, 0, 3]
                },
                {
                  columns: [
                    { text: 'CUENTAS BANCARIAS', bold: true, width: 150 },
                    { text: 'Cta. Ahorro BCP SOLES : 285-73324313-0-28\nCta. Corriente INTERBANK SOLES : 420-3004429019\nCta. Corriente BBVA SOLES : 0011-0083-0200284243\nCUENTAS A NOMBRE DE CORPORACION CUSCOGO S.A.C', width: '*' }
                  ],
                  margin: [0, 0, 0, 5]
                },
                {
                  columns: [
                    { text: 'RESPUESTA SUNAT', bold: true, width: 150 },
                    { text: `La Boleta numero ${sale.series}-${saleCorrelative}, ha sido aceptada`, width: '*' }
                  ]
                }
              ]
            },
            {
              width: '25%',
              text: ''
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // ── BOTTOM (QR & LEGALS) ──
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Autorizado mediante resolución Nº 034-005-0010431/SUNAT', margin: [0, 2] },
                { text: `Representación impresa de la ${docTypeLabel.replace('\n', ' ')}`, margin: [0, 2] },
                { text: 'Para consultar el comprobante visita www.cuscogo.com', margin: [0, 2] },
                { text: `Resumen sozmHKMaYC3n4/AZVH7paA39PXs=`, margin: [0, 2] },
                { text: '\nCONDICIONES COMERCIALES :', alignment: 'center', margin: [0, 10, 0, 2] },
                { text: 'Validez de la cotizacion 03 días calendarios.', alignment: 'center', margin: [0, 0, 0, 2] },
                { text: 'No se aceptan cambios ni devoluciones que no sean por fallas o defectos de fabricación.', alignment: 'center', margin: [0, 0, 0, 2] },
              ]
            },
            {
              width: 90,
              image: qrCodeDataUrl,
              alignment: 'right'
            }
          ]
        }
      ],
      styles: {}
    };

    return this.createPdfBuffer(docDefinition);
  }

  private async createPdfBuffer(docDefinition: any): Promise<Buffer> {
    try {
      // Use the standard pdfmake instance for Node.js
      const pdfMake = require('pdfmake');
      
      // Set the fonts for the instance
      pdfMake.fonts = fonts;

      // Create the document
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      // getBuffer() returns a Promise in pdfmake v0.3+
      const buffer = await pdfDoc.getBuffer();
      
      return buffer;
    } catch (error) {
      this.logger.error('Error generating PDF', error);
      throw error;
    }
  }
}
