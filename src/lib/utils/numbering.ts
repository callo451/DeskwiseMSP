import { ModuleType } from '@/lib/services/numbering-schemes';

/**
 * Generate the next ID for a given module type
 * This is a utility function that can be used by other modules
 */
export async function generateNextId(moduleType: ModuleType): Promise<string> {
  try {
    const response = await fetch('/api/numbering-schemes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ moduleType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ID for ${moduleType}`);
    }

    const data = await response.json();
    return data.nextId;
  } catch (error) {
    console.error('Error generating next ID:', error);
    // Fallback to a simple timestamp-based ID
    return `${moduleType.toUpperCase()}-${Date.now()}`;
  }
}

/**
 * Validate ID format for a given module type
 */
export function validateIdFormat(id: string, moduleType: ModuleType): boolean {
  // Basic validation - should contain the module type in some form
  const modulePrefix = moduleType.toUpperCase();
  return id.includes(modulePrefix) || id.includes(modulePrefix.substring(0, 3));
}

/**
 * Extract the number from a generated ID
 */
export function extractNumberFromId(id: string): number | null {
  const match = id.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Get the expected module type from an ID
 */
export function getModuleTypeFromId(id: string): ModuleType | null {
  const upperCaseId = id.toUpperCase();
  
  if (upperCaseId.includes('TKT') || upperCaseId.includes('TICKET')) {
    return 'tickets';
  } else if (upperCaseId.includes('CHG') || upperCaseId.includes('CHANGE')) {
    return 'changes';
  } else if (upperCaseId.includes('AST') || upperCaseId.includes('ASSET')) {
    return 'assets';
  } else if (upperCaseId.includes('KB') || upperCaseId.includes('ARTICLE')) {
    return 'articles';
  } else if (upperCaseId.includes('INC') || upperCaseId.includes('INCIDENT')) {
    return 'incidents';
  } else if (upperCaseId.includes('PROJ') || upperCaseId.includes('PROJECT')) {
    return 'projects';
  }
  
  return null;
}

/**
 * Format a number according to a numbering scheme
 */
export function formatNumber(number: number, paddingLength: number = 5): string {
  return number.toString().padStart(paddingLength, '0');
}