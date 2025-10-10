import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "../../api";
import { Download } from "lucide-react";

function MealPreferencesSummaryDownload() {
    const generatePDF = async () => {
        try {
            const [prefsRes, mealsRes] = await Promise.all([
                api.get("/meal-preferences/summary"),
                api.get("/meals"),
            ]);

            const prefs = prefsRes.data || [];
            const meals = mealsRes.data?.data || mealsRes.data || [];

            if (prefs.length === 0) {
                alert("No meal preferences available.");
                return;
            }

            const doc = new jsPDF();

            // === Header block ===
            doc.setFillColor(255, 243, 230); // light beige/orange
            doc.roundedRect(10, 10, 190, 25, 5, 5, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(200, 80, 40); // warm orange for header text
            doc.text("Elder Meal Preferences Summary", 16, 26);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 16, 32);

            // === Elder Profiles Table ===
            doc.autoTable({
                startY: 50,
                head: [
                    [
                        "#",
                        "Elder Name",
                        "Breakfast",
                        "Lunch",
                        "Dinner",
                        "Snacks",
                        "Other"
                    ],
                ],
                body: prefs.map((pref, index) => [
                    index + 1,
                    pref.elder?.fullName || "-",
                    (pref.selections?.breakfast || [])
                        .map((m) => m.name)
                        .join(", ") || "-",
                    (pref.selections?.lunch || [])
                        .map((m) => m.name)
                        .join(", ") || "-",
                    (pref.selections?.dinner || [])
                        .map((m) => m.name)
                        .join(", ") || "-",
                    (pref.selections?.snacks || [])
                        .map((m) => m.name)
                        .join(", ") || "-",
                    (pref.selections?.other || [])
                        .map((m) => m.name)
                        .join(", ") || "-"
                ]),
                theme: "grid",
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: {
                    fillColor: [255, 243, 230],   // beige/orange background
                    textColor: [0, 0, 0],         // black text
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: [255, 250, 245] },
                margin: { left: 14, right: 14 },
            });

            // === New page for Meals ===
            doc.addPage();
            let tableY = 20;
            const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"];

            categories.forEach((category) => {
                const categoryMeals = meals.filter(
                    (m) => m.category === category
                );
                if (categoryMeals.length > 0) {
                    doc.setFontSize(14);
                    doc.setTextColor(200, 80, 40); // keep section titles orange
                    doc.text(`${category} Meals`, 14, tableY);

                    const tableData = categoryMeals.map((meal) => [
                        meal.name,
                        meal.description,
                        (meal.restrictions?.toInclude || []).join(", ") || "-",
                        (meal.restrictions?.toAvoid || []).join(", ") || "-",
                    ]);

                    doc.autoTable({
                        startY: tableY + 6,
                        head: [["Meal Name", "Description", "Includes", "Avoid"]],
                        body: tableData,
                        styles: { fontSize: 9, cellPadding: 3 },
                        headStyles: {
                            fillColor: [255, 243, 230],  // beige/orange background
                            textColor: [0, 0, 0],        // black text
                            fontStyle: "bold",
                        },
                        alternateRowStyles: { fillColor: [255, 250, 245] },
                        margin: { left: 14, right: 14 },
                    });

                    tableY = doc.lastAutoTable.finalY + 14;
                }
            });

            // === Footer ===
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(
                "Elder Care Nutrition Services | Confidential Document",
                14,
                290
            );
            doc.text(
                "For questions or updates, please contact your nutrition coordinator",
                14,
                296
            );

            // Save PDF
            doc.save("elder_meal_preferences_summary.pdf");
        } catch (error) {
            console.error("Error generating meal summary PDF:", error);
        }
    };

    return (
        <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium px-6 py-3 rounded-xl shadow-md transition duration-200"
        >
            <Download className="w-5 h-5" />
            Download Meal Summary
        </button>
    );
}

export default MealPreferencesSummaryDownload;
