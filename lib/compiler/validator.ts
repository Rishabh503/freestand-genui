interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const DANGEROUS_PATTERNS = [
  { pattern: /eval\s*\(/, message: "eval() is not allowed" },
  { pattern: /Function\s*\(/, message: "Function constructor is not allowed" },
  { pattern: /dangerouslySetInnerHTML/, message: "dangerouslySetInnerHTML is not allowed" },
  { pattern: /document\.write/, message: "document.write is not allowed" },
  { pattern: /innerHTML\s*=/, message: "innerHTML assignment is not allowed" },
  { pattern: /__proto__/, message: "__proto__ is not allowed" },
  { pattern: /constructor\s*\[/, message: "constructor access is not allowed" },
];

const ALLOWED_IMPORTS = [
  "react",
  "lucide-react", 
  "recharts",
  "date-fns",
];

const REQUIRED_PATTERNS = [
  { pattern: /export\s+default/, message: "Component must have 'export default'" },
];

export function validateTSXCode(code: string): ValidationResult {
  const errors: string[] = [];

  // 1. Check for dangerous patterns
  for (const { pattern, message } of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // 2. Check for required patterns
  for (const { pattern, message } of REQUIRED_PATTERNS) {
    if (!pattern.test(code)) {
      errors.push(message);
    }
  }

  // 3. Check imports are allowed
  const importRegex = /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+(?:\s*,\s*\{[^}]*\})?))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  const foundImports: string[] = [];
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    foundImports.push(importPath);
    const isAllowed = ALLOWED_IMPORTS.some(allowed => importPath.startsWith(allowed));
    if (!isAllowed) {
      errors.push(`Import not allowed: ${importPath}. Only allowed: ${ALLOWED_IMPORTS.join(", ")}`);
    }
  }

  // Check if imports exist at all
  if (foundImports.length === 0 && (code.includes("useState") || code.includes("useEffect"))) {
    errors.push("React hooks are used but no imports found. Add: import React, { useState, useEffect } from 'react';");
  }

  // 4. Basic syntax checks
  // Check for unclosed brackets
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Mismatched parentheses: ${openParens} opening, ${closeParens} closing`);
  }

  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`);
  }

  // 5. Check for common React mistakes
  if (code.includes("useState") && !code.includes("import") && !code.includes("React.useState")) {
    errors.push("useState is used but not imported from 'react'");
  }

  if (code.includes("useEffect") && !code.includes("import") && !code.includes("React.useEffect")) {
    errors.push("useEffect is used but not imported from 'react'");
  }

  // 6. Check JSX is properly structured
  const jsxRegex = /<([A-Z]\w*)[^>]*>/g;
  const componentOpens = [];
  let jsxMatch;
  while ((jsxMatch = jsxRegex.exec(code)) !== null) {
    componentOpens.push(jsxMatch[1]);
  }

  // Basic JSX structure check - must have return statement in component
  if (code.includes("export default function") && !code.includes("return")) {
    errors.push("Component function must return JSX");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function extractComponentCode(llmOutput: string): string {
  // Extract code from markdown code blocks
  const codeBlockRegex = /```(?:tsx|typescript|jsx|ts|js)?\s*\n([\s\S]*?)\n```/;
  const match = llmOutput.match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  // If no code block, return as is
  return llmOutput.trim();
}