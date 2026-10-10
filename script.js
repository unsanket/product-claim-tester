/**
 * ==============================================================================
 * PRODUCT CLAIM TESTER - JAVASCRIPT ENGINE
 * Course: CE24MDM207 - Mathematical Foundation for GenAI
 * College: Marathwada Mitra Mandal's College of Engineering, Pune
 * Guided by: Dr. Swati Shekapure
 *
 * Description:
 * This script powers the entire application:
 * 1. Single Page Application (SPA) Tab Navigation
 * 2. Mathematical Statistical Engine (Normal CDF, Quantile Function, Z-Test)
 * 3. Step-by-Step Hypothesis Testing Walkthrough (5 Core Steps)
 * 4. Dynamic SVG Standard Normal Bell Curve Rendering
 * 5. Raw Data Analyzer (9 Descriptive Statistics & SVG Histogram)
 * 6. Pre-configured Engineering Problem Presets
 * 7. Browser Print / PDF Export Facility
 * ==============================================================================
 */

// Global state holding current test calculation results
let currentTestResult = null;
let currentDatasetStats = null;

// ==============================================================================
// 1. STATISTICAL MATHEMATICAL FUNCTIONS (PURE JAVASCRIPT)
// ==============================================================================

/**
 * Standard Error Function Approximation: erf(x)
 * Based on Abramowitz and Stegun Handbook of Mathematical Functions (Formula 7.1.26).
 * Maximum absolute error is strictly less than 1.5e-7.
 *
 * @param {number} x - Input real value
 * @returns {number} Value of erf(x)
 */
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  // Polynomial approximation coefficients
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Cumulative Distribution Function (CDF) for the Standard Normal Distribution: Phi(z)
 * Represents the probability P(Z <= z).
 * Formula: Phi(z) = 0.5 * (1 + erf(z / sqrt(2)))
 *
 * @param {number} z - Standardized z-score
 * @returns {number} Probability between 0.0 and 1.0
 */
function normalCdf(z) {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

/**
 * Probability Density Function (PDF) for Standard Normal Distribution: f(z)
 * Formula: f(z) = (1 / sqrt(2 * pi)) * exp(-z^2 / 2)
 *
 * @param {number} z - Standardized z-score
 * @returns {number} Density value at z
 */
function normalPdf(z) {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
}

/**
 * Inverse Normal Cumulative Distribution Function (Quantile Function): z = Phi^-1(p)
 * Uses Peter J. Acklam's rational approximation algorithm.
 * Computes exact critical z-scores for any significance level alpha.
 *
 * @param {number} p - Cumulative probability (0 < p < 1)
 * @returns {number} Corresponding z-score
 */
function normalInv(p) {
  if (p <= 0 || p >= 1) {
    throw new Error("Probability p must be strictly between 0 and 1.");
  }

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e+01,
     2.209460984245205e+02,
    -2.759285104469687e+02,
     1.383577518672690e+02,
    -3.066479806614716e+01,
     2.506628277459239e+00
  ];

  const b = [
    -5.447609879822406e+01,
     1.615858368580409e+02,
    -1.556989798598866e+02,
     6.680131188771972e+01,
    -1.328068155288572e+01
  ];

  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
     4.374664141464968e+00,
     2.938163982698783e+00
  ];

  const d = [
     7.784695709041462e-03,
     3.224671290700398e-01,
     2.445134137142996e+00,
     3.754408661907416e+00
  ];

  const p_low  = 0.02425;
  const p_high = 1.0 - p_low;

  let q, r;

  // Rational approximation for central region
  if (p > p_low && p < p_high) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
  }

  // Rational approximation for lower tail
  if (p <= p_low) {
    q = Math.sqrt(-2.0 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
  }

  // Rational approximation for upper tail
  q = Math.sqrt(-2.0 * Math.log(1.0 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
}

// ==============================================================================
// 2. CORE HYPOTHESIS TESTING LOGIC
// ==============================================================================

/**
 * Execute One-Sample Z-Test for Population Mean
 *
 * Formulas:
 * 1. Standard Error: SE = sigma / sqrt(n)
 * 2. Test Statistic: z = (x_bar - mu_0) / SE
 * 3. Decision Rules:
 *    - Left-Tailed ("at least"): Critical = -z_alpha. Reject if z < -z_alpha. p = Phi(z)
 *    - Right-Tailed ("at most"): Critical = +z_alpha. Reject if z > +z_alpha. p = 1 - Phi(z)
 *    - Two-Tailed ("exactly"): Critical = +/- z_(alpha/2). Reject if |z| > z_(alpha/2). p = 2 * (1 - Phi(|z|))
 *
 * @param {Object} params - Input parameters
 * @returns {Object} Comprehensive calculation result object
 */
function performZTest({ productName, claimType, mu0, xbar, sigma, n, alpha }) {
  // 1. Calculate Standard Error of the Mean
  const se = sigma / Math.sqrt(n);

  // 2. Calculate Test Statistic Z
  const diff = xbar - mu0;
  const z = diff / se;

  let testTail = '';
  let critVal = 0;
  let critValUpper = 0; // for two-tailed
  let pValue = 0;
  let isRejected = false;
  let rejectionRule = '';
  let h0Symbol = '';
  let h1Symbol = '';
  let verdictSummary = '';
  let plainEnglish = '';

  if (claimType === 'at_least') {
    // Left-tailed test: H0: mu >= mu0 vs H1: mu < mu0
    testTail = 'left';
    h0Symbol = `\\mu \\ge ${mu0}`;
    h1Symbol = `\\mu < ${mu0}`;
    critVal = normalInv(alpha); // e.g. normalInv(0.05) = -1.64485
    rejectionRule = `Reject H₀ if z < ${critVal.toFixed(3)}`;
    pValue = normalCdf(z);
    isRejected = z < critVal;

    if (isRejected) {
      verdictSummary = `DECISION: REJECT H₀ (CLAIM REFUTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the calculated test statistic (z = ${z.toFixed(4)}) falls in the critical rejection region (z < ${critVal.toFixed(3)}). Moreover, the p-value (${pValue.toFixed(4)}) is less than α (${alpha}). Therefore, we reject the null hypothesis. There is statistically significant evidence that the true average is less than the claimed ${mu0}. The manufacturer's claim of 'at least ${mu0}' is not supported by sample data.`;
    } else {
      verdictSummary = `DECISION: FAIL TO REJECT H₀ (CLAIM SUPPORTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the calculated test statistic (z = ${z.toFixed(4)}) does not fall in the rejection region (it is ≥ ${critVal.toFixed(3)}). The p-value (${pValue.toFixed(4)}) is ≥ α (${alpha}). We fail to reject the null hypothesis. There is insufficient statistical evidence to dispute the claim. The claim of 'at least ${mu0}' stands valid.`;
    }

  } else if (claimType === 'at_most') {
    // Right-tailed test: H0: mu <= mu0 vs H1: mu > mu0
    testTail = 'right';
    h0Symbol = `\\mu \\le ${mu0}`;
    h1Symbol = `\\mu > ${mu0}`;
    critVal = normalInv(1.0 - alpha); // e.g. normalInv(0.95) = +1.64485
    rejectionRule = `Reject H₀ if z > ${critVal.toFixed(3)}`;
    pValue = 1.0 - normalCdf(z);
    isRejected = z > critVal;

    if (isRejected) {
      verdictSummary = `DECISION: REJECT H₀ (CLAIM REFUTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the calculated test statistic (z = ${z.toFixed(4)}) falls in the critical rejection region (z > ${critVal.toFixed(3)}). The p-value (${pValue.toFixed(4)}) is less than α (${alpha}). We reject the null hypothesis. There is statistically significant evidence that the true average exceeds the claimed maximum of ${mu0}. The claim of 'at most ${mu0}' is violated.`;
    } else {
      verdictSummary = `DECISION: FAIL TO REJECT H₀ (CLAIM SUPPORTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the test statistic (z = ${z.toFixed(4)}) is within the acceptable threshold (≤ ${critVal.toFixed(3)}). The p-value (${pValue.toFixed(4)}) is ≥ α (${alpha}). We fail to reject the null hypothesis. The sample data supports the claim that the true average is at most ${mu0}.`;
    }

  } else {
    // Two-tailed test: H0: mu = mu0 vs H1: mu != mu0
    testTail = 'two';
    h0Symbol = `\\mu = ${mu0}`;
    h1Symbol = `\\mu \\ne ${mu0}`;
    const halfAlpha = alpha / 2.0;
    critVal = normalInv(halfAlpha); // e.g. -1.95996
    critValUpper = normalInv(1.0 - halfAlpha); // e.g. +1.95996
    rejectionRule = `Reject H₀ if |z| > ${critValUpper.toFixed(3)} (i.e. z < ${critVal.toFixed(3)} or z > ${critValUpper.toFixed(3)})`;
    pValue = 2.0 * (1.0 - normalCdf(Math.abs(z)));
    isRejected = Math.abs(z) > critValUpper;

    if (isRejected) {
      verdictSummary = `DECISION: REJECT H₀ (CLAIM REFUTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the calculated test statistic (z = ${z.toFixed(4)}) falls outside the acceptance interval [${critVal.toFixed(3)}, ${critValUpper.toFixed(3)}]. The two-tailed p-value (${pValue.toFixed(4)}) is less than α (${alpha}). We reject the null hypothesis. The product does not meet the exact specification of ${mu0}.`;
    } else {
      verdictSummary = `DECISION: FAIL TO REJECT H₀ (CLAIM SUPPORTED)`;
      plainEnglish = `At the ${(alpha * 100).toFixed(1)}% level of significance, the test statistic (z = ${z.toFixed(4)}) lies safely inside the acceptance region [${critVal.toFixed(3)}, ${critValUpper.toFixed(3)}]. The p-value (${pValue.toFixed(4)}) is ≥ α (${alpha}). We fail to reject the null hypothesis. The claim of exactly ${mu0} is consistent with the sample data.`;
    }
  }

  return {
    productName,
    claimType,
    mu0,
    xbar,
    sigma,
    n,
    alpha,
    se,
    diff,
    z,
    testTail,
    critVal,
    critValUpper,
    pValue,
    isRejected,
    rejectionRule,
    h0Symbol,
    h1Symbol,
    verdictSummary,
    plainEnglish
  };
}

// ==============================================================================
// 3. DYNAMIC SVG BELL CURVE VISUALIZATION
// ==============================================================================

/**
 * Render standard normal distribution with shaded critical rejection regions and test statistic z line.
 *
 * @param {Object} result - Calculation result from performZTest
 */
function renderBellCurve(result) {
  const svg = document.getElementById('bellCurveSvg');
  if (!svg) return;

  const width = 760;
  const height = 340;
  const margin = { top: 35, right: 45, bottom: 65, left: 45 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const zMin = -4.0;
  const zMax = 4.0;
  const maxPdf = 0.42; // slightly above normalPdf(0) = 0.3989 for head room

  // Mapping coordinate functions
  const toScreenX = (z) => margin.left + ((z - zMin) / (zMax - zMin)) * plotWidth;
  const toScreenY = (pdfVal) => margin.top + plotHeight - (pdfVal / maxPdf) * plotHeight;
  const baselineY = margin.top + plotHeight;

  // Sample points along normal curve
  const numSteps = 200;
  const curvePoints = [];
  for (let i = 0; i <= numSteps; i++) {
    const zVal = zMin + (i / numSteps) * (zMax - zMin);
    const pdfVal = normalPdf(zVal);
    curvePoints.push({
      z: zVal,
      x: toScreenX(zVal),
      y: toScreenY(pdfVal),
      pdf: pdfVal
    });
  }

  // Build SVG Content
  let svgContent = '';

  // Defs for gradients & patterns
  svgContent += `
    <defs>
      <linearGradient id="curveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="rejectGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0.12"/>
      </linearGradient>
      <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
      </filter>
    </defs>
  `;

  // 1. Acceptance Curve Full Background Fill
  let fullCurvePath = `M ${curvePoints[0].x.toFixed(2)} ${baselineY.toFixed(2)} `;
  for (const pt of curvePoints) {
    fullCurvePath += `L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)} `;
  }
  fullCurvePath += `L ${curvePoints[curvePoints.length - 1].x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
  svgContent += `<path d="${fullCurvePath}" fill="url(#curveFillGrad)"/>`;

  // 2. Shaded Rejection Region(s)
  function createTailPath(zStart, zEnd) {
    const tailPts = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const zVal = zStart + (i / steps) * (zEnd - zStart);
      tailPts.push({
        x: toScreenX(zVal),
        y: toScreenY(normalPdf(zVal))
      });
    }
    let p = `M ${tailPts[0].x.toFixed(2)} ${baselineY.toFixed(2)} `;
    for (const pt of tailPts) {
      p += `L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)} `;
    }
    p += `L ${tailPts[tailPts.length - 1].x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
    return p;
  }

  if (result.testTail === 'left') {
    // Shade left tail from -4 to critVal
    const leftCritClamped = Math.max(zMin, Math.min(zMax, result.critVal));
    const rejectPath = createTailPath(zMin, leftCritClamped);
    svgContent += `<path d="${rejectPath}" fill="url(#rejectGrad)"/>`;
  } else if (result.testTail === 'right') {
    // Shade right tail from critVal to +4
    const rightCritClamped = Math.max(zMin, Math.min(zMax, result.critVal));
    const rejectPath = createTailPath(rightCritClamped, zMax);
    svgContent += `<path d="${rejectPath}" fill="url(#rejectGrad)"/>`;
  } else if (result.testTail === 'two') {
    // Shade both tails
    const leftCritClamped = Math.max(zMin, Math.min(zMax, result.critVal));
    const rightCritClamped = Math.max(zMin, Math.min(zMax, result.critValUpper));
    const leftPath = createTailPath(zMin, leftCritClamped);
    const rightPath = createTailPath(rightCritClamped, zMax);
    svgContent += `<path d="${leftPath}" fill="url(#rejectGrad)"/>`;
    svgContent += `<path d="${rightPath}" fill="url(#rejectGrad)"/>`;
  }

  // 3. Gridlines & Baseline X-Axis
  svgContent += `<line x1="${margin.left}" y1="${baselineY}" x2="${margin.left + plotWidth}" y2="${baselineY}" stroke="#64748b" stroke-width="2"/>`;

  // Center vertical line at z = 0 (Mean)
  const zeroX = toScreenX(0);
  svgContent += `<line x1="${zeroX}" y1="${toScreenY(normalPdf(0))}" x2="${zeroX}" y2="${baselineY}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>`;

  // Draw ticks and labels at integers -3, -2, -1, 0, 1, 2, 3
  for (let tickZ = -3; tickZ <= 3; tickZ++) {
    const tx = toScreenX(tickZ);
    svgContent += `
      <line x1="${tx}" y1="${baselineY}" x2="${tx}" y2="${baselineY + 6}" stroke="#64748b" stroke-width="1.5"/>
      <text x="${tx}" y="${baselineY + 22}" text-anchor="middle" fill="#475569" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="500">${tickZ > 0 ? '+' + tickZ : tickZ}</text>
    `;
  }

  // Subtext under x axis
  svgContent += `<text x="${toScreenX(0)}" y="${baselineY + 44}" text-anchor="middle" fill="#64748b" font-size="12" font-weight="600">Standard Normal Z-Score (Standard Deviations from Mean μ)</text>`;

  // 4. Draw Bell Curve Line (Indigo)
  let curveLinePath = `M ${curvePoints[0].x.toFixed(2)} ${curvePoints[0].y.toFixed(2)} `;
  for (let i = 1; i < curvePoints.length; i++) {
    curveLinePath += `L ${curvePoints[i].x.toFixed(2)} ${curvePoints[i].y.toFixed(2)} `;
  }
  svgContent += `<path d="${curveLinePath}" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>`;

  // 5. Draw Critical Value Line(s) (Red Dashed)
  function drawCriticalLine(critZ, label) {
    if (critZ >= zMin && critZ <= zMax) {
      const cx = toScreenX(critZ);
      const cy = toScreenY(normalPdf(critZ));
      svgContent += `
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${baselineY}" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="4,4"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="#dc2626"/>
        <g transform="translate(${cx}, ${margin.top - 10})">
          <rect x="-42" y="-18" width="84" height="22" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="1.2"/>
          <text x="0" y="-3" text-anchor="middle" fill="#991b1b" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">${label} = ${critZ.toFixed(3)}</text>
        </g>
      `;
    }
  }

  if (result.testTail === 'left') {
    drawCriticalLine(result.critVal, 'z_crit');
  } else if (result.testTail === 'right') {
    drawCriticalLine(result.critVal, 'z_crit');
  } else if (result.testTail === 'two') {
    drawCriticalLine(result.critVal, '-z_crit');
    drawCriticalLine(result.critValUpper, '+z_crit');
  }

  // 6. Draw Test Statistic Z Marker (Solid Dark Line with Tag)
  const zVal = result.z;
  const isZVisible = zVal >= zMin && zVal <= zMax;
  const zPlotX = isZVisible ? toScreenX(zVal) : (zVal < zMin ? margin.left + 8 : margin.left + plotWidth - 8);
  const zPdfVal = isZVisible ? normalPdf(zVal) : 0.02;
  const zPlotY = toScreenY(zPdfVal);

  svgContent += `
    <line x1="${zPlotX}" y1="${Math.min(margin.top + 10, zPlotY - 10)}" x2="${zPlotX}" y2="${baselineY}" stroke="#0f172a" stroke-width="3"/>
    <circle cx="${zPlotX}" cy="${zPlotY}" r="6" fill="#0f172a" stroke="#ffffff" stroke-width="2.5" filter="url(#shadowFilter)"/>
    <g transform="translate(${zPlotX}, ${baselineY - 45})">
      <rect x="-46" y="-22" width="92" height="26" rx="5" fill="#0f172a" filter="url(#shadowFilter)"/>
      <text x="0" y="-5" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700" font-family="'JetBrains Mono', monospace">z = ${zVal.toFixed(3)}</text>
    </g>
  `;

  // If z was off-chart
  if (!isZVisible) {
    const offText = zVal < zMin ? `z = ${zVal.toFixed(2)} (← extreme left)` : `z = ${zVal.toFixed(2)} (extreme right →)`;
    svgContent += `
      <text x="${zPlotX}" y="${margin.top + 30}" text-anchor="${zVal < zMin ? 'start' : 'end'}" fill="#dc2626" font-size="12" font-weight="700">
        ${offText}
      </text>
    `;
  }

  svg.innerHTML = svgContent;
}

// ==============================================================================
// 4. TEST A CLAIM PAGE CONTROLLER & STEP-BY-STEP UPDATER
// ==============================================================================

/**
 * Handle form submission on "Test a Claim" page
 *
 * @param {Event} e - Submit event
 */
function handleClaimTestSubmit(e) {
  if (e) e.preventDefault();

  const errorBox = document.getElementById('testErrorMessage');
  errorBox.classList.add('hidden');
  errorBox.textContent = '';

  // Extract form inputs
  const productName = document.getElementById('productName').value.trim() || 'Specified Product';
  const claimTypeRadios = document.getElementsByName('claimType');
  let claimType = 'at_least';
  for (const r of claimTypeRadios) {
    if (r.checked) {
      claimType = r.value;
      break;
    }
  }

  const mu0Str = document.getElementById('claimedMean').value;
  const xbarStr = document.getElementById('sampleMean').value;
  const sigmaStr = document.getElementById('sigma').value;
  const nStr = document.getElementById('sampleSize').value;

  // Alpha selection
  const alphaSelect = document.getElementById('alpha').value;
  let alphaVal = 0.05;
  if (alphaSelect === 'custom') {
    const customAlphaInput = document.getElementById('customAlpha').value;
    alphaVal = parseFloat(customAlphaInput);
  } else {
    alphaVal = parseFloat(alphaSelect);
  }

  // Input Validation
  const mu0 = parseFloat(mu0Str);
  const xbar = parseFloat(xbarStr);
  const sigma = parseFloat(sigmaStr);
  const n = parseInt(nStr, 10);

  if (isNaN(mu0)) {
    showError("Please enter a valid number for Claimed Mean (μ₀).");
    return;
  }
  if (isNaN(xbar)) {
    showError("Please enter a valid number for Sample Mean (x̄).");
    return;
  }
  if (isNaN(sigma) || sigma <= 0) {
    showError("Population Standard Deviation (σ) must be a strictly positive number greater than 0.");
    return;
  }
  if (isNaN(n) || n < 1 || !Number.isInteger(n)) {
    showError("Sample Size (n) must be an integer greater than or equal to 1.");
    return;
  }
  if (isNaN(alphaVal) || alphaVal <= 0 || alphaVal >= 1) {
    showError("Significance level (α) must be between 0 and 1 (typically 0.01, 0.05, or 0.10).");
    return;
  }

  // Perform statistical testing
  try {
    const result = performZTest({
      productName,
      claimType,
      mu0,
      xbar,
      sigma,
      n,
      alpha: alphaVal
    });

    currentTestResult = result;

    // Update Quick Overview Cards
    updateQuickStats(result);

    // Render Step-by-Step Breakdown
    updateStepByStepDisplay(result);

    // Render SVG Bell Curve
    renderBellCurve(result);

    // Scroll smoothly to results
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    showError("Error computing test statistics: " + err.message);
  }
}

/**
 * Display input validation error message
 *
 * @param {string} msg - Error description
 */
function showError(msg) {
  const errorBox = document.getElementById('testErrorMessage');
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

/**
 * Update quick overview metrics on side panel
 */
function updateQuickStats(res) {
  const labelMap = {
    at_least: 'At least (Left-Tailed)',
    at_most: 'At most (Right-Tailed)',
    equal: 'Exactly (Two-Tailed)'
  };
  document.getElementById('quickClaimType').textContent = labelMap[res.claimType] || res.claimType;
  document.getElementById('quickDiff').textContent = (res.diff >= 0 ? '+' : '') + res.diff.toFixed(2);
  document.getElementById('quickSE').textContent = res.se.toFixed(4);
  document.getElementById('quickZ').textContent = res.z.toFixed(4);
}

/**
 * Update the 5-step breakdown report in DOM
 */
function updateStepByStepDisplay(res) {
  // Update header subtitle
  const typeText = res.claimType === 'at_least' ? '≥' : (res.claimType === 'at_most' ? '≤' : '=');
  document.getElementById('resultsSubject').textContent =
    `Product: ${res.productName} • Claim: ${typeText} ${res.mu0} • Sample: n = ${res.n}, x̄ = ${res.xbar}`;

  // Step 1: Hypotheses
  const h0Elem = document.getElementById('h0Formula');
  const h1Elem = document.getElementById('h1Formula');
  const tailDesc = document.getElementById('tailExplanation');

  if (res.claimType === 'at_least') {
    h0Elem.innerHTML = `<strong>H₀:</strong> μ ≥ ${res.mu0} (Claim)`;
    h1Elem.innerHTML = `<strong>H₁:</strong> μ &lt; ${res.mu0} (Defective / Refuting)`;
    tailDesc.innerHTML = `Because the alternative hypothesis ($H_1$) asserts values strictly less than ${res.mu0}, this is a <strong>Left-Tailed (One-Tailed) Z-Test</strong>.`;
  } else if (res.claimType === 'at_most') {
    h0Elem.innerHTML = `<strong>H₀:</strong> μ ≤ ${res.mu0} (Claim)`;
    h1Elem.innerHTML = `<strong>H₁:</strong> μ &gt; ${res.mu0} (Exceeding / Refuting)`;
    tailDesc.innerHTML = `Because the alternative hypothesis ($H_1$) asserts values strictly greater than ${res.mu0}, this is a <strong>Right-Tailed (One-Tailed) Z-Test</strong>.`;
  } else {
    h0Elem.innerHTML = `<strong>H₀:</strong> μ = ${res.mu0} (Claim)`;
    h1Elem.innerHTML = `<strong>H₁:</strong> μ ≠ ${res.mu0} (Difference)`;
    tailDesc.innerHTML = `Because the alternative hypothesis ($H_1$) tests for deviation in either direction, this is a <strong>Two-Tailed Z-Test</strong> with $\\alpha / 2 = ${(res.alpha/2).toFixed(4)}$.`;
  }

  // Step 2: Alpha
  document.getElementById('step2Alpha').textContent = `${res.alpha} (${(res.alpha * 100).toFixed(1)}%)`;
  document.getElementById('step2Conf').textContent = `${(1 - res.alpha).toFixed(2)} (${((1 - res.alpha) * 100).toFixed(1)}%)`;

  // Step 3: Critical Value
  const critElem = document.getElementById('step3CritVal');
  const ruleElem = document.getElementById('step3Rule');
  const noteElem = document.getElementById('step3Annotation');

  if (res.testTail === 'left') {
    critElem.textContent = res.critVal.toFixed(3);
    ruleElem.textContent = `Reject H₀ if z < ${res.critVal.toFixed(3)}`;
    noteElem.innerHTML = `With $\\alpha = ${res.alpha}$, the critical cutoff on the left tail is <strong>${res.critVal.toFixed(3)}</strong>. Calculated $z$ must be less than this to reject $H_0$.`;
  } else if (res.testTail === 'right') {
    critElem.textContent = `+${res.critVal.toFixed(3)}`;
    ruleElem.textContent = `Reject H₀ if z > +${res.critVal.toFixed(3)}`;
    noteElem.innerHTML = `With $\\alpha = ${res.alpha}$, the critical cutoff on the right tail is <strong>+${res.critVal.toFixed(3)}</strong>. Calculated $z$ must exceed this to reject $H_0$.`;
  } else {
    critElem.textContent = `±${res.critValUpper.toFixed(3)}`;
    ruleElem.textContent = `Reject H₀ if |z| > ${res.critValUpper.toFixed(3)} (z < ${res.critVal.toFixed(3)} or z > +${res.critValUpper.toFixed(3)})`;
    noteElem.innerHTML = `With $\\alpha/2 = ${(res.alpha/2).toFixed(4)}$, the critical region consists of both tails outside $[${res.critVal.toFixed(3)}, +${res.critValUpper.toFixed(3)}]$.`;
  }

  // Step 4: Test Statistic Z (formula with actual substitution)
  const substElem = document.getElementById('step4Substitution');
  const seElem = document.getElementById('step4SE');

  const diffStr = (res.xbar - res.mu0).toFixed(2);
  const sqrtNStr = Math.sqrt(res.n).toFixed(2);
  const seStr = res.se.toFixed(4);
  const zStr = res.z.toFixed(4);

  substElem.innerHTML = `
    z = \\frac{${res.xbar} - ${res.mu0}}{\\frac{${res.sigma}}{\\sqrt{${res.n}}}}
      = \\frac{${diffStr}}{\\frac{${res.sigma}}{${sqrtNStr}}}
      = \\frac{${diffStr}}{${seStr}}
      = \\mathbf{${zStr}}
  `;

  seElem.innerHTML = `Standard Error (\\text{SE}) = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${res.sigma}}{\\sqrt{${res.n}}} = ${seStr}`;

  // Step 5: P-Value
  const pElem = document.getElementById('step5PVal');
  const compElem = document.getElementById('step5Comparison');
  const pNoteElem = document.getElementById('step5Annotation');

  pElem.textContent = `${res.pValue.toFixed(4)} (${(res.pValue * 100).toFixed(2)}%)`;
  if (res.isRejected) {
    compElem.innerHTML = `p\\text{-value} (${res.pValue.toFixed(4)}) &lt; \\alpha (${res.alpha}) \\implies \\mathbf{Reject\\ H_0}`;
    pNoteElem.innerHTML = `Because the $p$-value (${res.pValue.toFixed(4)}) is strictly less than the threshold $\\alpha = ${res.alpha}$, the observed data is too improbable under $H_0$.`;
  } else {
    compElem.innerHTML = `p\\text{-value} (${res.pValue.toFixed(4)}) \\ge \\alpha (${res.alpha}) \\implies \\mathbf{Fail\\ to\\ Reject\\ H_0}`;
    pNoteElem.innerHTML = `Because the $p$-value (${res.pValue.toFixed(4)}) is greater than or equal to $\\alpha = ${res.alpha}$, the observed variation is plausible purely by random chance.`;
  }

  // Final Verdict Box
  const verdictBox = document.getElementById('verdictBox');
  const verdictStatus = document.getElementById('verdictStatus');
  const verdictHeadline = document.getElementById('verdictHeadline');
  const verdictExplanation = document.getElementById('verdictExplanation');
  const verdictIcon = document.getElementById('verdictIcon');

  if (res.isRejected) {
    verdictBox.className = 'verdict-box verdict-reject';
    verdictStatus.textContent = res.verdictSummary;
    verdictHeadline.textContent = `The Product Fails the Claim Test (${res.productName})`;
    verdictExplanation.textContent = res.plainEnglish;
    verdictIcon.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    `;
  } else {
    verdictBox.className = 'verdict-box verdict-accept';
    verdictStatus.textContent = res.verdictSummary;
    verdictHeadline.textContent = `The Claim is Statistically Supported (${res.productName})`;
    verdictExplanation.textContent = res.plainEnglish;
    verdictIcon.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    `;
  }
}

/**
 * Handle custom alpha input toggle
 */
function handleAlphaChange(val) {
  const customInput = document.getElementById('customAlpha');
  if (val === 'custom') {
    customInput.classList.remove('hidden');
    customInput.required = true;
    customInput.value = '0.02';
  } else {
    customInput.classList.add('hidden');
    customInput.required = false;
  }
}

/**
 * Reset test parameters to clean defaults
 */
function resetTestForm() {
  document.getElementById('productName').value = 'Specified Product';
  document.querySelector('input[name="claimType"][value="at_least"]').checked = true;
  document.getElementById('claimedMean').value = '1000';
  document.getElementById('sampleMean').value = '980';
  document.getElementById('sigma').value = '60';
  document.getElementById('sampleSize').value = '36';
  document.getElementById('alpha').value = '0.05';
  handleAlphaChange('0.05');
  document.getElementById('testErrorMessage').classList.add('hidden');
  handleClaimTestSubmit();
}

/**
 * Download test result as PDF via browser print dialogue
 */
function downloadResultPDF() {
  window.print();
}

// ==============================================================================
// 5. PAGE 3: MY DATA (DESCRIPTIVE STATISTICS & SVG HISTOGRAM)
// ==============================================================================

/**
 * Parse raw input string and calculate all 9 summary statistics
 */
function processRawData() {
  const text = document.getElementById('rawDataInput').value.trim();
  if (!text) {
    alert("Please enter or paste at least two numbers to calculate statistics.");
    return;
  }

  // Parse comma, semicolon, space, or newline separated numbers
  const tokens = text.split(/[\s,;]+/).filter(t => t.length > 0);
  const numbers = [];

  for (const t of tokens) {
    const val = parseFloat(t);
    if (!isNaN(val)) {
      numbers.push(val);
    }
  }

  if (numbers.length < 2) {
    alert("Please provide at least 2 valid numeric observations.");
    return;
  }

  const n = numbers.length;

  // 1. Sort numbers for median, min, max
  numbers.sort((a, b) => a - b);

  // 2. Count
  const count = n;

  // 3. Mean
  const sum = numbers.reduce((acc, x) => acc + x, 0);
  const mean = sum / n;

  // 4. Median
  let median = 0;
  if (n % 2 === 1) {
    median = numbers[Math.floor(n / 2)];
  } else {
    const mid1 = numbers[n / 2 - 1];
    const mid2 = numbers[n / 2];
    median = (mid1 + mid2) / 2.0;
  }

  // 5. Mode
  const freqMap = {};
  let maxFreq = 0;
  for (const num of numbers) {
    // Round to 4 decimals for float grouping
    const key = num.toFixed(4);
    freqMap[key] = (freqMap[key] || 0) + 1;
    if (freqMap[key] > maxFreq) {
      maxFreq = freqMap[key];
    }
  }

  let modeStr = '';
  if (maxFreq === 1) {
    modeStr = 'No Mode (Unique)';
  } else {
    const modes = Object.keys(freqMap)
      .filter(k => freqMap[k] === maxFreq)
      .map(k => parseFloat(k));
    if (modes.length > 3) {
      modeStr = `Multimodal (${modes.length} modes)`;
    } else {
      modeStr = modes.join(', ');
    }
  }

  // 6. Minimum & Maximum
  const min = numbers[0];
  const max = numbers[n - 1];

  // 7. Range
  const range = max - min;

  // 8. Sample Variance: sum((x - mean)^2) / (n - 1)
  const sumSqDiff = numbers.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
  const sampleVariance = sumSqDiff / (n - 1);

  // 9. Sample Standard Deviation: sqrt(sampleVariance)
  const sampleStdDev = Math.sqrt(sampleVariance);

  // Store in state
  currentDatasetStats = {
    numbers,
    count,
    mean,
    median,
    modeStr,
    min,
    max,
    range,
    sampleVariance,
    sampleStdDev
  };

  // Update UI Elements
  document.getElementById('statCount').textContent = count;
  document.getElementById('statMean').textContent = mean.toFixed(4);
  document.getElementById('statMedian').textContent = median.toFixed(4);
  document.getElementById('statMode').textContent = modeStr;
  document.getElementById('statMin').textContent = min.toFixed(2);
  document.getElementById('statMax').textContent = max.toFixed(2);
  document.getElementById('statRange').textContent = range.toFixed(2);
  document.getElementById('statVariance').textContent = sampleVariance.toFixed(4);
  document.getElementById('statStdDev').textContent = sampleStdDev.toFixed(4);

  // Small sample warning for n < 30
  const warningBox = document.getElementById('sampleSizeWarning');
  const warningCount = document.getElementById('warningNCount');
  if (count < 30) {
    warningCount.textContent = count;
    warningBox.classList.remove('hidden');
  } else {
    warningBox.classList.add('hidden');
  }

  // Enable "Use this data for the test" button
  const useBtn = document.getElementById('btnUseDataForTest');
  useBtn.disabled = false;

  // Draw Histogram
  renderHistogram(numbers, mean, min, max);
}

/**
 * Render responsive SVG Histogram with automated binning and sample mean overlay
 */
function renderHistogram(data, mean, min, max) {
  const svg = document.getElementById('histogramSvg');
  if (!svg) return;

  const width = 760;
  const height = 320;
  const margin = { top: 35, right: 40, bottom: 65, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const baselineY = margin.top + plotHeight;

  // Choose number of bins based on Sturges' rule or sqrt(n)
  const n = data.length;
  let numBins = Math.max(5, Math.min(10, Math.ceil(Math.sqrt(n))));
  if (min === max) numBins = 1;

  const binWidth = (max - min) / numBins;
  const bins = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    bins.push({
      start: binStart,
      end: binEnd,
      count: 0
    });
  }

  // Count items into bins
  for (const val of data) {
    let placed = false;
    for (let i = 0; i < numBins; i++) {
      // Last bin includes the maximum value
      if (i === numBins - 1 ? (val >= bins[i].start && val <= bins[i].end) : (val >= bins[i].start && val < bins[i].end)) {
        bins[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed && bins.length > 0) {
      bins[bins.length - 1].count++;
    }
  }

  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const barSvgWidth = plotWidth / numBins;

  let svgHtml = `
    <defs>
      <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
  `;

  // Draw Y-axis gridlines and labels
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const tickVal = Math.round((i / yTicks) * maxCount);
    const yPos = baselineY - (tickVal / maxCount) * plotHeight;
    svgHtml += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + plotWidth}" y2="${yPos}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" text-anchor="end" fill="#64748b" font-size="11" font-family="'JetBrains Mono', monospace">${tickVal}</text>
    `;
  }

  // Baseline X-Axis
  svgHtml += `<line x1="${margin.left}" y1="${baselineY}" x2="${margin.left + plotWidth}" y2="${baselineY}" stroke="#64748b" stroke-width="2"/>`;

  // Draw Bars
  bins.forEach((bin, idx) => {
    const barHeight = (bin.count / maxCount) * plotHeight;
    const xPos = margin.left + idx * barSvgWidth;
    const yPos = baselineY - barHeight;
    const padding = 4;

    svgHtml += `
      <rect x="${xPos + padding}" y="${yPos}" width="${barSvgWidth - padding * 2}" height="${barHeight}" fill="url(#barGrad)" rx="3">
        <title>Range: [${bin.start.toFixed(1)} - ${bin.end.toFixed(1)}] | Frequency: ${bin.count}</title>
      </rect>
      <!-- Count label above bar -->
      ${bin.count > 0 ? `<text x="${xPos + barSvgWidth / 2}" y="${yPos - 6}" text-anchor="middle" fill="#1e40af" font-size="12" font-weight="700" font-family="'JetBrains Mono', monospace">${bin.count}</text>` : ''}
      <!-- Bin range tick label on x-axis -->
      <line x1="${xPos}" y1="${baselineY}" x2="${xPos}" y2="${baselineY + 5}" stroke="#94a3b8" stroke-width="1"/>
      <text x="${xPos + barSvgWidth / 2}" y="${baselineY + 20}" text-anchor="middle" fill="#64748b" font-size="10" font-family="'JetBrains Mono', monospace">${bin.start.toFixed(1)}</text>
    `;
  });

  // End tick on x-axis
  svgHtml += `
    <line x1="${margin.left + plotWidth}" y1="${baselineY}" x2="${margin.left + plotWidth}" y2="${baselineY + 5}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${margin.left + plotWidth}" y="${baselineY + 20}" text-anchor="middle" fill="#64748b" font-size="10" font-family="'JetBrains Mono', monospace">${max.toFixed(1)}</text>
  `;

  // Mean Overlay Line (Dashed Red)
  if (max > min) {
    const meanX = margin.left + ((mean - min) / (max - min)) * plotWidth;
    svgHtml += `
      <line x1="${meanX}" y1="${margin.top}" x2="${meanX}" y2="${baselineY}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4"/>
      <g transform="translate(${meanX}, ${margin.top - 8})">
        <rect x="-38" y="-18" width="76" height="20" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="1"/>
        <text x="0" y="-4" text-anchor="middle" fill="#b91c1c" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">x̄ = ${mean.toFixed(1)}</text>
      </g>
    `;
  }

  // Axis Title Labels
  svgHtml += `
    <text x="${margin.left + plotWidth / 2}" y="${baselineY + 45}" text-anchor="middle" fill="#475569" font-size="12" font-weight="600">Measurement Values (Binned Intervals)</text>
    <text x="16" y="${margin.top + plotHeight / 2}" text-anchor="middle" fill="#475569" font-size="12" font-weight="600" transform="rotate(-90, 16, ${margin.top + plotHeight / 2})">Frequency</text>
  `;

  svg.innerHTML = svgHtml;
  document.getElementById('histSubtitle').textContent =
    `Dataset distribution (n = ${n}, x̄ = ${mean.toFixed(2)}, s = ${Math.sqrt(sumSqDiff / (n - 1)).toFixed(2)})`;
}

/**
 * Transfer statistics from My Data into the Test a Claim page
 */
function useDataForClaimTest() {
  if (!currentDatasetStats) return;

  // Set inputs on claim test page
  const sampleMeanInput = document.getElementById('sampleMean');
  const sigmaInput = document.getElementById('sigma');
  const sampleSizeInput = document.getElementById('sampleSize');

  sampleMeanInput.value = currentDatasetStats.mean.toFixed(2);
  sigmaInput.value = currentDatasetStats.sampleStdDev.toFixed(2);
  sampleSizeInput.value = currentDatasetStats.count;

  // Navigate to Test tab
  navigateTo('test');

  // Trigger flash animation
  [sampleMeanInput, sigmaInput, sampleSizeInput].forEach(elem => {
    elem.classList.add('flash-highlight');
    setTimeout(() => elem.classList.remove('flash-highlight'), 1300);
  });

  // Automatically execute test
  handleClaimTestSubmit();
}

/**
 * Load sample dataset into My Data textarea
 */
function loadSampleDataset(type) {
  const textarea = document.getElementById('rawDataInput');
  if (type === 'led36') {
    // 36 industrial LED bulb hours matching mean around 980, std around 60
    textarea.value = `982, 975, 1010, 940, 995, 960, 970, 985, 1020, 990,
955, 988, 965, 975, 1005, 980, 992, 945, 968, 972,
985, 990, 1015, 960, 978, 984, 950, 995, 970, 982,
966, 974, 988, 992, 958, 976`;
  } else if (type === 'small') {
    // Small sample n = 12 (triggers Central Limit Theorem t-test warning)
    textarea.value = `23.5, 24.1, 22.8, 21.9, 23.0, 22.5, 24.0, 21.8, 22.9, 23.4, 22.2, 23.1`;
  }
  processRawData();
}

/**
 * Clear raw data input box
 */
function clearDataInput() {
  document.getElementById('rawDataInput').value = '';
  document.getElementById('statCount').textContent = '—';
  document.getElementById('statMean').textContent = '—';
  document.getElementById('statMedian').textContent = '—';
  document.getElementById('statMode').textContent = '—';
  document.getElementById('statMin').textContent = '—';
  document.getElementById('statMax').textContent = '—';
  document.getElementById('statRange').textContent = '—';
  document.getElementById('statVariance').textContent = '—';
  document.getElementById('statStdDev').textContent = '—';
  document.getElementById('btnUseDataForTest').disabled = true;
  document.getElementById('sampleSizeWarning').classList.add('hidden');

  const svg = document.getElementById('histogramSvg');
  if (svg) {
    svg.innerHTML = `<text x="380" y="160" text-anchor="middle" fill="#94a3b8" font-size="14">Enter data above and click "Calculate Statistics & Plot" to view histogram</text>`;
  }
}

// ==============================================================================
// 6. EXAMPLE CARDS PRESET LOADER (HOME PAGE)
// ==============================================================================

/**
 * Load one of the 4 pre-configured scenario cards from Home page
 *
 * @param {string} scenario - 'battery' | 'led' | 'attendance' | 'canteen'
 */
function loadExample(scenario) {
  const configs = {
    // 1. Smartphone Battery
    battery: {
      name: 'Flagship Smartphone Battery',
      claimType: 'at_least',
      mu0: 24.0,
      xbar: 22.8,
      sigma: 3.2,
      n: 45,
      alpha: 0.05
    },
    // 2. LED Bulb Life (Course Benchmark Case)
    // Quality Rule requirement: mu0=1000, xbar=980, sigma=60, n=36, alpha=0.05 -> z=-2.00, crit=-1.645, Reject H0
    led: {
      name: 'Industrial LED Bulb 1000h Life',
      claimType: 'at_least',
      mu0: 1000,
      xbar: 980,
      sigma: 60,
      n: 36,
      alpha: 0.05
    },
    // 3. Class Attendance
    attendance: {
      name: 'Semester Lecture Attendance Policy',
      claimType: 'at_least',
      mu0: 75.0,
      xbar: 72.4,
      sigma: 8.5,
      n: 40,
      alpha: 0.05
    },
    // 4. Canteen Waiting Time
    canteen: {
      name: 'Campus Canteen Peak Wait Time',
      claimType: 'at_most',
      mu0: 10.0,
      xbar: 11.2,
      sigma: 2.8,
      n: 35,
      alpha: 0.05
    }
  };

  const item = configs[scenario];
  if (!item) return;

  // Set form inputs
  document.getElementById('productName').value = item.name;
  const radio = document.querySelector(`input[name="claimType"][value="${item.claimType}"]`);
  if (radio) radio.checked = true;

  document.getElementById('claimedMean').value = item.mu0;
  document.getElementById('sampleMean').value = item.xbar;
  document.getElementById('sigma').value = item.sigma;
  document.getElementById('sampleSize').value = item.n;
  document.getElementById('alpha').value = item.alpha.toString();
  handleAlphaChange(item.alpha.toString());

  // Switch to "Test a Claim" page
  navigateTo('test');

  // Immediately run the test
  handleClaimTestSubmit();
}

// ==============================================================================
// 7. SPA NAVIGATION & TAB SWITCHER
// ==============================================================================

/**
 * Navigate to a specific page section
 *
 * @param {string} pageId - 'home' | 'test' | 'data' | 'about'
 */
function navigateTo(pageId) {
  // Update nav tabs
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-page') === pageId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update page sections
  const pages = document.querySelectorAll('.page-section');
  pages.forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  // Update window URL hash without jumping
  window.history.replaceState(null, '', `#${pageId}`);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================================================================
// 8. STUDENT & AUTHOR CUSTOMIZATION (FOOTER MODAL)
// ==============================================================================

function openStudentModal() {
  const currentName = localStorage.getItem('mf_student_name') || 'Sanket';
  const currentRoll = localStorage.getItem('mf_student_roll') || 'SYCO201';
  document.getElementById('inputStudentName').value = currentName;
  document.getElementById('inputStudentRoll').value = currentRoll;
  document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

function saveStudentInfo() {
  const name = document.getElementById('inputStudentName').value.trim() || 'Sanket';
  const roll = document.getElementById('inputStudentRoll').value.trim() || 'SYCO201';
  localStorage.setItem('mf_student_name', name);
  localStorage.setItem('mf_student_roll', roll);
  loadStudentInfo();
  closeStudentModal();
}

function loadStudentInfo() {
  const savedName = localStorage.getItem('mf_student_name') || 'Sanket';
  const savedRoll = localStorage.getItem('mf_student_roll') || 'SYCO201';
  const nameDisplay = document.getElementById('studentNameDisplay');
  const rollDisplay = document.getElementById('studentRollDisplay');
  if (nameDisplay) nameDisplay.textContent = savedName;
  if (rollDisplay) rollDisplay.textContent = savedRoll;
}

// ==============================================================================
// 9. INITIALIZATION ON PAGE LOAD
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Bind tab click events
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const page = tab.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Editable name / roll click triggers modal
  const nameDisplay = document.getElementById('studentNameDisplay');
  const rollDisplay = document.getElementById('studentRollDisplay');
  if (nameDisplay) nameDisplay.addEventListener('click', openStudentModal);
  if (rollDisplay) rollDisplay.addEventListener('click', openStudentModal);

  // Restore student info from localStorage if exists
  loadStudentInfo();

  // Handle URL hash on initial load
  const hash = window.location.hash.replace('#', '');
  if (hash && ['home', 'test', 'data', 'about'].includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }

  // Pre-calculate initial test so the results section is ready immediately
  handleClaimTestSubmit();

  // Pre-load sample dataset 1 into My Data
  loadSampleDataset('led36');
});
