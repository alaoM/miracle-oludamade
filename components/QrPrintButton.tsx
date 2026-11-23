"use client";

import React from "react";
import { Printer } from "lucide-react";

export function QrPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-magenta-dark"
    >
      <Printer className="h-4 w-4" />
      <span>Print / Download PDF</span>
    </button>
  );
}
