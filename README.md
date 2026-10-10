# Product Claim Tester using Hypothesis Testing
**An Interactive Web Application for Statistical Quality Assurance & Inferential Claim Validation**

---

### Academic Affiliation & Course Details
- **Institution:** Marathwada Mitra Mandal's College of Engineering (MMCOE), Pune
- **Department:** Department of Computer Engineering
- **Class & Program:** Second Year B.Tech (SY COMP)
- **Course Code & Title:** **CE24MDM207: Mathematical Foundation for GenAI**
- **Prepared by:** Sanket [Your Name], Roll No: [Roll No]
- **Guided by:** Dr. Swati Shekapure

---

## 1. Project Overview

In consumer markets and engineering domains, manufacturers regularly promote product specifications:
* *"Our smartphone battery lasts at least 24 hours on a single charge."*
* *"Our industrial LED bulbs deliver at least 1,000 hours of continuous operation."*
* *"The campus cafeteria lunch queue waiting time is at most 10 minutes."*

Can consumers, quality assurance engineers, or data scientists trust these assertions without mathematical verification? 

The **Product Claim Tester** is an accessible, modern, browser-based web application that implements classical **Inferential Hypothesis Testing (One-Sample $Z$-Test for Population Mean)** to evaluate real-world product specifications. It translates sample test statistics into standardized critical regions, exact $p$-values, visual standard normal distributions, and clear plain-English consumer verdicts.

No installation, build tools, or server configurations are required. The entire application runs natively in any standard modern web browser using client-side **HTML5, CSS3, and JavaScript**.

---

## 2. Key Features

### 🌟 1. Academic & Professional Dual-Layer UI
- **College Header Banner:** Prominently highlights **Marathwada Mitra Mandal's College of Engineering, Pune**, the Computer Engineering Department, and course **CE24MDM207: Mathematical Foundation for GenAI**.
- **Modern SaaS Aesthetics:** Designed with smooth border radii, refined drop shadows, accessible color contrast, and responsive layout grids (desktop, tablet, mobile).
- **Personalized Attribution:** Interactive student name and roll number editor in the footer with automatic persistence (`localStorage`).

### 📱 2. Four Dedicated Application Pages (Tabs)
1. **Home (`#home`):**
   - High-level intuitive overview of hypothesis testing principles.
   - Interactive pipeline diagram illustrating the 4-step workflow.
   - **4 Pre-configured Engineering Problem Cards** (*Smartphone Battery*, *LED Bulb Life*, *Class Attendance*, and *Canteen Wait Time*). Clicking any card automatically pre-fills parameters into the tester and computes the results.
2. **Test a Claim (`#test`):**
   - Flexible claim hypothesis modes:
     - **At least ($\mu \ge \mu_0$)** $\to$ Left-tailed test
     - **At most ($\mu \le \mu_0$)** $\to$ Right-tailed test
     - **Exactly ($\mu = \mu_0$)** $\to$ Two-tailed test
   - Live statistical calculation of Standard Error ($\text{SE}$) and $Z$-score.
   - **Step-by-Step 5-Stage Mathematical Report** showing formulas with substituted numerical values.
   - **High-Contrast Verdict Box:** Bold Red for *"Reject $H_0$ (Claim Refuted)"* or Bold Green for *"Fail to Reject $H_0$ (Claim Supported)"* with clear consumer explanations.
   - **Dynamic SVG Standard Normal Bell Curve ($Z$-Distribution):** Clean mathematical plot with shaded critical rejection regions, dashed critical value lines, and test statistic marker.
   - **PDF Export Button:** Browser-native print trigger with a custom `@media print` layout.
3. **My Data (`#data`):**
   - Raw measurement input textarea accepting values separated by commas, spaces, tabs, or newlines.
   - Automatic calculation of **9 Descriptive Statistics**:
     1. Sample Count ($n$)
     2. Sample Mean ($\bar{x}$)
     3. Sample Median
     4. Sample Mode (handles unique, unimodal, and multimodal datasets)
     5. Minimum ($\min$)
     6. Maximum ($\max$)
     7. Range ($\max - \min$)
     8. Sample Variance ($s^2$)
     9. Sample Standard Deviation ($s$)
   - **Small Sample Size Alert:** Prominently notifies users when $n < 30$ that according to the Central Limit Theorem, a *Student's t-test* is theoretically more accurate when population standard deviation is unknown.
   - **Interactive SVG Histogram:** Automated bin calculation (Sturges / square-root rule), bar frequencies, hover tooltips, and sample mean overlay line.
   - **"Use this Data for the Test" Button:** Instantly pipes sample statistics ($\bar{x}$, $s$, and $n$) directly into the Claim Tester.
4. **About & Theory (`#about`):**
   - Comprehensive explanation of the **5 Steps of Hypothesis Testing**.
   - Structured reference table defining symbols: $H_0$, $H_1$, $\alpha$, $z_{\text{crit}}$, $z$, and $p$-value.
   - Mapping to course lab assignments.

---

## 3. Project File Structure

```text
mf mini project/
├── index.html        # Complete semantic HTML5 structure, college banner, 4 tabbed pages, and modals
├── style.css         # Clean responsive CSS styling, typography, cards, SVG styling, and print stylesheet
├── script.js         # Pure JavaScript statistical engine (Normal CDF, Quantile function, SVG generators)
└── README.md         # Comprehensive project documentation, mathematical theory, and lab reference
```

### Detailed File Responsibilities
* **`index.html`:**
  - Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
  - Google Fonts integration (`Inter` for UI and `JetBrains Mono` for mathematics).
  - SVG placeholders for the standard normal bell curve and frequency histogram.
  - Interactive modal dialog for student attribution customization.
* **`style.css`:**
  - Modern design tokens (CSS variables for color palettes, spacing, shadows, and radii).
  - Flexbox and CSS Grid layouts for multi-column dashboards.
  - Visual status color indicators (Indigo primary, Emerald green for acceptance, Crimson red for rejection).
  - Dedicated `@media print` rules optimizing the page for clean single-page or multi-page A4 PDF printing.
* **`script.js`:**
  - **Statistical Math Kernel:** Implementation of the error function $\text{erf}(x)$ via Abramowitz & Stegun formula 7.1.26, standard normal CDF $\Phi(z)$, and Acklam's inverse normal CDF (quantile function).
  - **Hypothesis Decision Engine:** Formulates $H_0$ and $H_1$, computes $\text{SE}$, $z$, $z_{\text{crit}}$, and exact $p$-values.
  - **Dynamic SVG Rendering:** Programmatically generates scalable vector paths for the normal bell curve (with shaded rejection area) and histogram bars.
  - **Data Parser:** Processes delimited numbers into 9 descriptive statistical indicators.

---

## 4. Mathematical Foundations & Statistical Formulas

### 4.1 Formulating Null ($H_0$) & Alternative ($H_1$) Hypotheses

| Claim Type | Manufacturer Claim Statement | Null Hypothesis ($H_0$) | Alternative Hypothesis ($H_1$) | Direction of Test |
| :--- | :--- | :--- | :--- | :--- |
| **"At least"** | Mean is at least $\mu_0$ ($\mu \ge \mu_0$) | $H_0: \mu \ge \mu_0$ | $H_1: \mu < \mu_0$ | **Left-Tailed Test** |
| **"At most"** | Mean is at most $\mu_0$ ($\mu \le \mu_0$) | $H_0: \mu \le \mu_0$ | $H_1: \mu > \mu_0$ | **Right-Tailed Test** |
| **"Exactly"** | Mean equals $\mu_0$ ($\mu = \mu_0$) | $H_0: \mu = \mu_0$ | $H_1: \mu \ne \mu_0$ | **Two-Tailed Test** |

---

### 4.2 Standard Error of the Mean ($\text{SE}$)
The standard deviation of the sampling distribution of sample means:
$$\text{SE} = \frac{\sigma}{\sqrt{n}}$$
*Where:*
* $\sigma$ = Known population standard deviation (or sample standard deviation $s$ for large samples $n \ge 30$)
* $n$ = Sample size

---

### 4.3 Test Statistic ($z$)
The standardized distance between the observed sample mean $\bar{x}$ and the claimed population mean $\mu_0$:
$$z = \frac{\bar{x} - \mu_0}{\text{SE}} = \frac{\bar{x} - \mu_0}{\frac{\sigma}{\sqrt{n}}}$$

---

### 4.4 Critical Values & Rejection Criteria

Given significance level $\alpha$ (e.g., $\alpha = 0.05$):

1. **Left-Tailed Test ("At least"):**
   - Critical value: $z_{\text{crit}} = -z_\alpha$ (e.g., $-1.645$ for $\alpha = 0.05$)
   - Rejection Rule: **Reject $H_0$ if $z < -z_\alpha$**
   - $p$-value: $p = P(Z \le z) = \Phi(z)$

2. **Right-Tailed Test ("At most"):**
   - Critical value: $z_{\text{crit}} = +z_\alpha$ (e.g., $+1.645$ for $\alpha = 0.05$)
   - Rejection Rule: **Reject $H_0$ if $z > +z_\alpha$**
   - $p$-value: $p = P(Z \ge z) = 1 - \Phi(z)$

3. **Two-Tailed Test ("Exactly"):**
   - Critical values: $\pm z_{\alpha/2}$ (e.g., $\pm 1.960$ for $\alpha = 0.05$)
   - Rejection Rule: **Reject $H_0$ if $|z| > z_{\alpha/2}$** (i.e. $z < -z_{\alpha/2}$ or $z > +z_{\alpha/2}$)
   - $p$-value: $p = 2 \times [1 - \Phi(|z|)]$

---

### 4.5 Descriptive Statistics (My Data Page)

1. **Sample Mean ($\bar{x}$):**
   $$\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$$
2. **Sample Variance ($s^2$):**
   $$s^2 = \frac{1}{n - 1} \sum_{i=1}^{n} (x_i - \bar{x})^2$$
3. **Sample Standard Deviation ($s$):**
   $$s = \sqrt{s^2} = \sqrt{\frac{1}{n - 1} \sum_{i=1}^{n} (x_i - \bar{x})^2}$$
4. **Range:**
   $$\text{Range} = x_{\max} - x_{\min}$$

---

## 5. Verification Benchmark Test Case

The system is calibrated and verified against the following benchmark problem:

* **Scenario:** Industrial LED Bulb Life Testing
* **Manufacturer Claim:** *At least 1,000 hours* ($\mu_0 = 1000$, claim type = "at least")
* **Sample Mean ($\bar{x}$):** 980 hours
* **Population Standard Deviation ($\sigma$):** 60 hours
* **Sample Size ($n$):** 36 bulbs
* **Significance Level ($\alpha$):** 0.05 (5%)

### Step-by-Step Calculation:
1. **Hypotheses:**
   * $H_0: \mu \ge 1000$ (Manufacturer claim)
   * $H_1: \mu < 1000$ (Left-tailed test)
2. **Significance Level:** $\alpha = 0.05$
3. **Critical Value:**
   $$z_{\text{crit}} = \Phi^{-1}(0.05) = -1.645$$
   *Rejection Rule: Reject $H_0$ if $z < -1.645$*
4. **Test Statistic ($z$):**
   $$\text{SE} = \frac{60}{\sqrt{36}} = \frac{60}{6} = 10.00$$
   $$z = \frac{980 - 1000}{10.00} = \frac{-20}{10.00} = \mathbf{-2.00}$$
5. **$p$-Value:**
   $$p = P(Z \le -2.00) = \Phi(-2.00) = \mathbf{0.0228} \quad (2.28\%)$$
6. **Decision & Conclusion:**
   * Since $z = -2.00 < -1.645$ and $p\text{-value } (0.0228) < \alpha\ (0.05)$, we **Reject $H_0$**.
   * **Verdict:** The manufacturer's claim of at least 1,000 hours is **refuted**. There is statistically significant evidence at the 5% level that the true mean life is less than 1,000 hours.

---

## 6. How to Run the Project

### Method 1: Direct Browser Launch (Recommended - Zero Setup)
1. Navigate to the project directory: `c:\Users\SANKET\mf mini project`.
2. Double-click `index.html` (or right-click $\to$ Open with Google Chrome / Microsoft Edge / Mozilla Firefox).
3. The web application will load instantly with full functionality.

### Method 2: Local HTTP Server (Optional)
If you prefer running through a local development server:

* **Using Python:**
  ```powershell
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your web browser.

* **Using Node.js (`npx serve`):**
  ```powershell
  npx serve .
  ```

* **Using VS Code:**
  Install the **Live Server** extension and click **"Go Live"** on `index.html`.

---

## 7. Syllabus & Lab Curriculum Mapping

This mini-project aligns with the practical syllabus of **CE24MDM207: Mathematical Foundation for GenAI** at MMCOE Pune:

* **Lab Assignment 6:** Formulation of null ($H_0$) and alternative ($H_1$) hypotheses; understanding Type I error ($\alpha$) and Type II error ($\beta$) risks.
* **Lab Assignment 7:** Execution of large-sample hypothesis testing for a single population mean ($Z$-test) with known population variance or estimated sample variance ($n \ge 30$).
* **Lab Assignment 8:** Formulation of formal rejection rules via critical value and $p$-value methods; visualization of standard normal rejection regions.

---

## 8. Viva-Voce / Oral Examination Quick Reference

| Viva Question | Concise Answer for Students |
| :--- | :--- |
| **Why do we use a $Z$-test instead of a $t$-test?** | A $Z$-test is valid when the population standard deviation ($\sigma$) is known, or when the sample size is large ($n \ge 30$), where the Central Limit Theorem ensures the sample mean is normally distributed. |
| **What happens if $n < 30$?** | If $n < 30$ and $\sigma$ is unknown, a Student's $t$-test with $n - 1$ degrees of freedom is theoretically more appropriate because sample variance introduces additional variability. |
| **What does a $p$-value of 0.0228 mean?** | It means there is only a 2.28% probability of observing a sample mean as low as 980 hours purely by random chance if the true population mean were really 1,000 hours. Since $2.28\% < 5\%$, we reject the null hypothesis. |
| **What is the significance level $\alpha$?** | $\alpha$ is the probability of committing a Type I error (rejecting a true null hypothesis). The standard benchmark is 5% ($\alpha = 0.05$). |

---

## 9. License & Attribution

- **Developed for:** Academic Evaluation at Marathwada Mitra Mandal's College of Engineering, Pune.
- **Course:** CE24MDM207: Mathematical Foundation for GenAI (Department of Computer Engineering).
- **Faculty Guide:** Dr. Swati Shekapure.
