// lib/compiler/validator.ts
import ts from "typescript";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const DANGEROUS_PATTERNS = [
  /eval\s*\(/,
  /Function\s*\(/,
  /dangerouslySetInnerHTML/,
  /document\.write/,
  /innerHTML\s*=/,
  /__proto__/,
  /constructor\s*\[/,
];

const ALLOWED_IMPORTS = [
  "react",
  "lucide-react",
  "recharts",
  "date-fns",
];

export function validateTSXCode(code: string): ValidationResult {
  const errors: string[] = [];

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }

  // Check for disallowed imports
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    if (!ALLOWED_IMPORTS.some(allowed => importPath.startsWith(allowed))) {
      errors.push(`Disallowed import: ${importPath}`);
    }
  }

  // TypeScript compilation check
  const sourceFile = ts.createSourceFile(
    "temp.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const compilerOptions: ts.CompilerOptions = {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: true,
    noEmit: true,
  };

  const host = ts.createCompilerHost(compilerOptions);
  host.getSourceFile = (fileName) => {
    if (fileName === "temp.tsx") return sourceFile;
    return undefined;
  };
  host.writeFile = () => {};
  host.getCurrentDirectory = () => "";
  host.getCanonicalFileName = (fileName) => fileName;
  host.useCaseSensitiveFileNames = () => true;
  host.getNewLine = () => "\n";
  host.fileExists = () => true;
  host.readFile = () => "";

  const program = ts.createProgram(["temp.tsx"], compilerOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  diagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      errors.push(message);
    }
  });

  // Check for export default
  if (!code.includes("export default")) {
    errors.push("Component must have 'export default'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function extractComponentCode(llmOutput: string): string {
  // Extract code from markdown code blocks
  const codeBlockRegex = /```(?:tsx|typescript|jsx)?\n([\s\S]*?)\n```/;
  const match = llmOutput.match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  // If no code block, return as is
  return llmOutput.trim();
}