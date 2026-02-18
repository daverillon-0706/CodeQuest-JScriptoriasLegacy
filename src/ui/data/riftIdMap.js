// src/ui/data/riftIdMap.js
export const RIFT_ID_MAP = {
  "Syntax Monolith": "Syntax",
  "Data Types Monolith": "DataTypes",
  "Variables Monolith": "Variables",
  "Operators Monolith": "Operators",
  "Conditions Monolith": "Conditions",
  "Array Monolith": "Array",
  "Functions Monolith": "Functions"
};

export function normalizeRiftName(name) {
    return RIFT_ID_MAP[name] ?? name;
}