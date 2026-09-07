/**
 * api.js — Client services for FastAPI compliance backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Check a privacy policy text against India's DPDP Act 2023.
 * @param {string} policyText - Plain text of the startup privacy policy.
 * @returns {Promise<Object>} ComplianceResponse schema.
 */
export async function checkCompliance(policyText) {
  const endpoint = `${API_BASE_URL}/api/check`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ policy_text: policyText }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to analyze privacy policy.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `Server returned HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Health check to verify backend server connectivity.
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
