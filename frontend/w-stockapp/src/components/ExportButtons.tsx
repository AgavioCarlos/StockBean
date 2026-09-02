import React from "react";
import { PdfButton, ExcelButton } from "./SharedButton";
import { exportToExcel, exportToPdf, ExportColumn } from "../utils/exportHelper";

interface ExportPdfButtonProps<T> {
    data: T[];
    columns: ExportColumn<T>[];
    fileName?: string;
    reportTitle?: string;
    reportSubtitle?: string;
    disabled?: boolean;
}

export const ExportPdfButton = <T,>({
    data,
    columns,
    fileName = "Reporte",
    reportTitle = "Reporte del Sistema",
    reportSubtitle = "",
    disabled = false,
}: ExportPdfButtonProps<T>) => {
    const handleExportPdf = () => {
        exportToPdf(data, columns, fileName, reportTitle, reportSubtitle);
    };

    return (
        <PdfButton onClick={handleExportPdf} disabled={disabled || data.length === 0} />
    );
};

interface ExportExcelButtonProps<T> {
    data: T[];
    columns: ExportColumn<T>[];
    fileName?: string;
    disabled?: boolean;
}

export const ExportExcelButton = <T,>({
    data,
    columns,
    fileName = "Reporte",
    disabled = false,
}: ExportExcelButtonProps<T>) => {
    const handleExportExcel = () => {
        exportToExcel(data, columns, fileName);
    };

    return (
        <ExcelButton onClick={handleExportExcel} disabled={disabled || data.length === 0} />
    );
};
