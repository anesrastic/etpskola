import React from "react";
import {
  Document, Page, Text, View, StyleSheet, renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 9 },
  header: { marginBottom: 12 },
  headerTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  headerSub: { fontSize: 8, color: "#555" },
  table: { width: "100%" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#dcfce7", borderBottomWidth: 1, borderBottomColor: "#16a34a" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", backgroundColor: "#f0fdf4" },
  cell: { padding: "4 6", flex: 1 },
  cellNarrow: { padding: "4 6", width: 24 },
  headerText: { fontSize: 8, fontWeight: "bold", color: "#14532d" },
  cellText: { fontSize: 8 },
});

interface UcenikRow {
  redniBroj: number;
  ime: string;
  prezime: string;
  datumRodjenja: string;
  mestoRodjenja?: string | null;
  imeRoditelja?: string | null;
  adresa?: string | null;
  telefonUcenika?: string | null;
  telefonRoditelja?: string | null;
  izborni?: string | null;
  straniJezik?: string | null;
  maternji?: string | null;
  napomena?: string | null;
}

interface OdeljenjeInfo {
  naziv: string;
  smer: string;
  jezik: string;
  razredni: string;
  stepen?: string;
  skolskaGodina?: string;
}

function SpiskoPDF({ ucenici, odeljenje }: { ucenici: UcenikRow[]; odeljenje: OdeljenjeInfo }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", orientation: "landscape", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle },
          `${odeljenje.smer} · Odeljenje ${odeljenje.naziv} · ${odeljenje.skolskaGodina ?? "2025/2026"}`
        ),
        React.createElement(Text, { style: styles.headerSub },
          `Razredni starešina: ${odeljenje.razredni} · Jezik nastave: ${odeljenje.jezik}`
        ),
      ),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeaderRow },
          React.createElement(View, { style: styles.cellNarrow }, React.createElement(Text, { style: styles.headerText }, "Br.")),
          React.createElement(View, { style: { ...styles.cell, flex: 2 } }, React.createElement(Text, { style: styles.headerText }, "Ime i prezime")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Datum rođ.")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Mesto rođ.")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Roditelj")),
          React.createElement(View, { style: { ...styles.cell, flex: 2 } }, React.createElement(Text, { style: styles.headerText }, "Adresa")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Tel. učenik")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Tel. roditelj")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Izborni")),
          React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.headerText }, "Jezik")),
        ),
        ...ucenici.map((u, i) =>
          React.createElement(View, { key: u.redniBroj, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
            React.createElement(View, { style: styles.cellNarrow }, React.createElement(Text, { style: styles.cellText }, String(u.redniBroj))),
            React.createElement(View, { style: { ...styles.cell, flex: 2 } }, React.createElement(Text, { style: styles.cellText }, `${u.prezime} ${u.ime}`)),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.datumRodjenja)),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.mestoRodjenja ?? "")),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.imeRoditelja ?? "")),
            React.createElement(View, { style: { ...styles.cell, flex: 2 } }, React.createElement(Text, { style: styles.cellText }, u.adresa ?? "")),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.telefonUcenika ?? "")),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.telefonRoditelja ?? "")),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.izborni ?? "")),
            React.createElement(View, { style: styles.cell }, React.createElement(Text, { style: styles.cellText }, u.straniJezik ?? "")),
          )
        ),
      ),
    ),
  );
}

export async function buildPdfOdeljenje(
  ucenici: UcenikRow[],
  odeljenje: OdeljenjeInfo,
): Promise<Buffer> {
  const element = React.createElement(SpiskoPDF, { ucenici, odeljenje });
  return renderToBuffer(element);
}
