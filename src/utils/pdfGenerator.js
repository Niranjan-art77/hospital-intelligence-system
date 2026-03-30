import jsPDF from "jspdf";
import "jspdf-autotable";

export const generatePrescriptionPDF = (p, user) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(56, 189, 248);
    doc.text("NOVA HEALTH AI", 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text("Official Medical Prescription", 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient Name: ${user.fullName}`, 14, 45);
    doc.text(`Doctor: Dr. ${p.doctor?.name || "Unknown"}`, 14, 52);
    doc.text(`Date: ${new Date(p.createdAt).toLocaleDateString()}`, 14, 59);
    doc.text(`Prescription ID: #${p.id}`, 14, 66);

    const tableColumn = ["Medicine", "Dosage", "Timing", "Days", "Notes"];
    const tableRows = [];

    p.items?.forEach(req => {
        let timings = [];
        if (req.morning) timings.push("Morning");
        if (req.afternoon) timings.push("Afternoon");
        if (req.night) timings.push("Night");

        let timingStr = timings.length > 0 ? timings.join(", ") : "As prescribed";

        const rowData = [
            req.medicineName,
            req.dosage,
            timingStr,
            req.days.toString(),
            req.notes || "-"
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'grid',
        headStyles: { fillColor: [56, 189, 248] }
    });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an electronically generated document.", 14, doc.lastAutoTable.finalY + 20);

    doc.save(`Nova_Prescription_${p.id}.pdf`);
};
