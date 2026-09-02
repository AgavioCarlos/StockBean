import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn<T> {
    label: string;
    getValue: (item: T) => any;
}

/**
 * Exporta un listado de datos a un archivo Excel (.xlsx) de manera estructurada y estética.
 */
export const exportToExcel = <T>(
    data: T[],
    columns: ExportColumn<T>[],
    fileName: string
): void => {
    // Mapear los datos según las columnas configuradas
    const rows = data.map((item) => {
        const row: Record<string, any> = {};
        columns.forEach((col) => {
            row[col.label] = col.getValue(item);
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // Ajustar el ancho de las columnas dinámicamente según el contenido
    const maxLens = columns.map((col) => {
        let maxLen = col.label.length;
        rows.forEach((r) => {
            const val = String(r[col.label] ?? "");
            if (val.length > maxLen) {
                maxLen = val.length;
            }
        });
        return { wch: maxLen + 4 }; // Margen adicional
    });
    worksheet["!cols"] = maxLens;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exporta un listado de datos a un reporte profesional en PDF (tamaño A4) con diseño corporativo Baluarte.
 */
export const exportToPdf = <T>(
    data: T[],
    columns: ExportColumn<T>[],
    fileName: string,
    title: string,
    subtitle?: string
): void => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Colores del tema corporativo Baluarte (Indigo y Slate)
    const primaryColor = [79, 70, 229]; // Indigo 600
    const textColor = [30, 41, 59]; // Slate 800
    const lightTextColor = [100, 116, 139]; // Slate 500

    const logoX = 15;
    const logoY = 15;

    // Encabezado del reporte
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, logoX, logoY + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);

    let currentY = logoY + 11;
    if (subtitle) {
        doc.text(subtitle, logoX, currentY);
        currentY += 5;
    }

    const formattedDate = new Date().toLocaleString("es-MX", {
        timeZoneName: "short",
    });
    doc.text(`Fecha y hora de generación: ${formattedDate}`, logoX, currentY);
    currentY += 8;

    // Línea divisoria decorativa
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.line(logoX, currentY - 3, 195, currentY - 3);

    // Preparar cabeceras y filas para la tabla
    const headers = [columns.map((col) => col.label)];
    const rows = data.map((item) => columns.map((col) => col.getValue(item)));

    // Renderizar la tabla con jspdf-autotable
    autoTable(doc, {
        startY: currentY,
        head: headers,
        body: rows,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
            halign: "left",
        },
        bodyStyles: {
            fontSize: 8,
            textColor: textColor as [number, number, number],
            font: "helvetica",
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Slate 50
        },
        margin: { left: logoX, right: 15 },
        didDrawPage: (dataInfo) => {
            // Dibujar pie de página en cada página
            const str = `Página ${dataInfo.pageNumber}`;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);

            // Línea sobre el pie de página
            doc.setDrawColor(241, 245, 249); // Slate 100
            doc.line(logoX, 282, 195, 282);

            doc.text("Baluarte ERP - Sistema de Gestión de Inventarios", logoX, 287);
            doc.text(str, 195 - doc.getTextWidth(str), 287);
        },
    });

    doc.save(`${fileName}.pdf`);
};
