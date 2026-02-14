import { Detection, DISEASE_INFO } from '@/types';

export function generateReport(detection: Detection) {
  // 1. Create a hidden iframe instead of opening a new window
  // This prevents Electron from trying to open an external URL
  const iframe = document.createElement('iframe');
  
  // Style the iframe to be invisible but still part of the DOM
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  
  // Append to the body so we can access its document
  document.body.appendChild(iframe);

  // Get the iframe's document to write into
  const printDocument = iframe.contentWindow?.document;
  
  if (!printDocument) {
    alert('Error: Could not create print preview.');
    // Cleanup if it failed
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    return;
  }

  // --- Start of Data Processing (Kept exactly as original) ---

  const diseaseName = detection.classification
    ? DISEASE_INFO[detection.classification]?.name || detection.classification
    : 'Pending';

  const confidencePercent = (detection.confidence * 100).toFixed(1);
  const reportId = `DET-${detection.id.substring(0, 8).toUpperCase()}`;
  const generatedAt = new Date();
  const analysisDate = new Date(detection.createdAt);

  const urgencyLabel = detection.reviewUrgency
    ? detection.reviewUrgency.charAt(0).toUpperCase() + detection.reviewUrgency.slice(1)
    : 'Routine';

  const urgencyColor =
    detection.reviewUrgency === 'urgent' ? '#c0392b' :
    detection.reviewUrgency === 'priority' ? '#e67e22' : '#27ae60';

  const findingsRows = (detection.preliminaryFindings || [])
    .map((f, i) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;color:#555;">${i + 1}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${f.finding}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">
          <span style="color:${f.detected ? '#27ae60' : '#999'};font-weight:600;">${f.detected ? 'Detected' : 'Not Detected'}</span>
        </td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;text-transform:capitalize;">${f.confidence}</td>
      </tr>
    `).join('');

  const doctorReviewSection = detection.doctorReview ? `
    <div style="margin-top:28px;">
      <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;">Doctor's Review</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;width:30%;">Reviewed By</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${detection.doctorReview.doctorName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Severity</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-transform:capitalize;">${detection.doctorReview.severity}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Clinical Diagnosis</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${detection.doctorReview.diagnosis}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Recommendations</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${detection.doctorReview.recommendations}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Follow-up Date</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${detection.doctorReview.followUpDate ? new Date(detection.doctorReview.followUpDate).toLocaleDateString() : 'Not scheduled'}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Reviewed On</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${new Date(detection.doctorReview.reviewedAt).toLocaleString()}</td>
        </tr>
      </table>
    </div>
  ` : '';

  const fundusImageSection = detection.imageBase64 ? `
    <div style="margin-top:28px;text-align:center;">
      <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;text-align:left;">Fundus Image</h2>
      <img src="${detection.imageBase64}" alt="Fundus Image" style="max-width:320px;max-height:280px;border:1px solid #ddd;border-radius:4px;" />
      <p style="font-size:11px;color:#888;margin-top:6px;">Fundus photograph captured during examination</p>
    </div>
  ` : '';

  // --- End of Data Processing ---

  // 2. Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BrightSight Report - ${detection.patientName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; line-height:1.5; padding:40px; max-width:800px; margin:0 auto; }
    @media print {
      body { padding:20px; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
  <div style="border-bottom:3px solid #2c3e50;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:700;color:#2c3e50;margin-bottom:2px;">BRIGHTSIGHT EYE CLINIC</h1>
    <p style="font-size:15px;color:#555;margin-bottom:8px;">Pre-Diagnosis Report</p>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#777;">
      <span>Report ID: ${reportId}</span>
      <span>Generated: ${generatedAt.toLocaleDateString()} at ${generatedAt.toLocaleTimeString()}</span>
    </div>
  </div>

  <div style="margin-bottom:24px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;">Patient Information</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;width:30%;">Patient Name</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${detection.patientName}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Age</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${detection.patientAge} years</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Date of Analysis</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${analysisDate.toLocaleDateString()} at ${analysisDate.toLocaleTimeString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Status</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-transform:capitalize;">${detection.status}</td>
      </tr>
      ${detection.remarks ? `
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:600;">Remarks</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${detection.remarks}</td>
      </tr>` : ''}
    </table>
  </div>

  ${fundusImageSection}

  ${detection.classification ? `
  <div style="margin-top:28px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;">Classification Result</h2>
    <div style="background:#f0f4f8;border:1px solid #d0d7de;border-left:4px solid #2c3e50;border-radius:4px;padding:16px;margin-bottom:12px;">
      <table style="width:100%;">
        <tr>
          <td style="font-weight:600;padding:4px 0;width:30%;">Classification</td>
          <td style="font-size:16px;font-weight:700;color:#2c3e50;">${diseaseName}</td>
        </tr>
        <tr>
          <td style="font-weight:600;padding:4px 0;">Confidence</td>
          <td style="font-size:16px;font-weight:700;">${confidencePercent}%</td>
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${(detection.preliminaryFindings && detection.preliminaryFindings.length > 0) ? `
  <div style="margin-top:28px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;">Preliminary Findings</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#2c3e50;color:#fff;">
          <th style="padding:8px 12px;border:1px solid #2c3e50;width:40px;">#</th>
          <th style="padding:8px 12px;border:1px solid #2c3e50;text-align:left;">Finding</th>
          <th style="padding:8px 12px;border:1px solid #2c3e50;width:120px;">Status</th>
          <th style="padding:8px 12px;border:1px solid #2c3e50;width:100px;">Confidence</th>
        </tr>
      </thead>
      <tbody>${findingsRows}</tbody>
    </table>
  </div>
  ` : ''}

  <div style="margin-top:28px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:6px;margin-bottom:16px;">Review Recommendation</h2>
    <div style="padding:12px 16px;border-radius:4px;border-left:4px solid ${urgencyColor};background:#fafafa;">
      <span style="font-weight:700;color:${urgencyColor};font-size:15px;">${urgencyLabel}</span>
      <span style="color:#555;margin-left:8px;">
        ${detection.reviewUrgency === 'urgent' ? '— Schedule immediate specialist consultation.' :
          detection.reviewUrgency === 'priority' ? '— Follow-up recommended within 1–2 weeks.' :
          '— Continue routine monitoring as scheduled.'}
      </span>
    </div>
  </div>

  ${doctorReviewSection}

  <div style="margin-top:36px;padding-top:16px;border-top:1px solid #ddd;">
    <p style="font-size:11px;color:#999;line-height:1.6;">
      <strong>Disclaimer:</strong> This report is generated by an AI-assisted pre-diagnosis system and is intended to support, not replace, professional clinical judgment. 
      All findings are preliminary and must be reviewed and confirmed by a qualified ophthalmologist before any clinical decisions are made.
    </p>
  </div>

  <div style="margin-top:16px;text-align:center;">
    <p style="font-size:10px;color:#aaa;">This report was generated by BrightSight Pre-Diagnosis System • ${generatedAt.toLocaleString()}</p>
  </div>

  <script>
    // Wait for everything to load (especially images) before printing
    window.onload = function() { 
      window.print(); 
    };
  </script>
</body>
</html>`;

  // 3. Write HTML to the iframe
  printDocument.open();
  printDocument.write(html);
  printDocument.close();

  // 4. Cleanup Logic
  // We remove the iframe after a delay to ensure the print dialog has appeared.
  // 5 seconds is generally safe for Electron/desktop environments.
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 5000);
}