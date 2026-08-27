import jsPDF from 'jspdf';

/**
 * Utility helper to sanitize text for CSV fields
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser file download using Blob and ObjectURL
 */
export function downloadFile(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export single Decision details as CSV (Excel compatible)
 */
export function exportDecisionToCSV(decision, userVote = null) {
  if (!decision) return;

  const rows = [];
  // UTF-8 BOM for Excel unicode support
  rows.push(['DecisionHub - Decision Export Report']);
  rows.push(['Generated At', new Date().toLocaleString()]);
  rows.push([]);

  // Metadata
  rows.push(['Decision ID', decision.id || 'N/A']);
  rows.push(['Title', decision.title || 'Untitled']);
  rows.push(['Status', decision.status || 'OPEN']);
  rows.push(['Category', decision.categoryName || 'General']);
  if (decision.communityName) {
    rows.push(['Community', decision.communityName]);
  }
  rows.push(['Created By', decision.createdBy?.name || decision.createdBy?.email || 'Anonymous']);
  rows.push(['Created Date', decision.createdAt ? new Date(decision.createdAt).toLocaleDateString() : 'N/A']);
  rows.push(['Total Views', decision.views || 0]);
  rows.push(['Total Votes', decision.votesCount || 0]);
  if (userVote) {
    rows.push(['Your Recorded Vote', userVote.optionText || 'Voted']);
  }
  rows.push([]);

  // Description
  rows.push(['Description']);
  rows.push([decision.description || 'No description provided.']);
  rows.push([]);

  // Attached Poll Options Breakdown
  if (decision.poll && decision.poll.options) {
    rows.push(['Poll Question', decision.poll.question || 'Attached Poll']);
    rows.push(['Option #', 'Option Text', 'Vote Count', 'Vote Share (%)', 'Your Choice']);

    const totalVotes = decision.votesCount || decision.poll.options.reduce((acc, o) => acc + (o.voteCount || 0), 0);

    decision.poll.options.forEach((opt, index) => {
      const vCount = opt.voteCount || 0;
      const pct = totalVotes > 0 ? ((vCount / totalVotes) * 100).toFixed(1) : '0.0';
      const isUserChoice = userVote && (Number(userVote.optionId) === Number(opt.id) || userVote.optionText === opt.optionText);
      rows.push([
        index + 1,
        opt.optionText || `Option ${index + 1}`,
        vCount,
        `${pct}%`,
        isUserChoice ? 'YES' : 'NO',
      ]);
    });
    rows.push([]);
  }

  // Comparison Matrix if present
  if (decision.comparisonFactors && decision.comparisonFactors.length > 0) {
    rows.push(['Multi-Criteria Comparison Matrix']);
    const factorHeaders = ['Option', ...decision.comparisonFactors.map((f) => f.name || f)];
    rows.push(factorHeaders);

    const options = decision.options || decision.poll?.options || [];
    options.forEach((opt) => {
      const row = [opt.optionText || opt.name];
      decision.comparisonFactors.forEach((factor) => {
        const factorId = factor.id || factor;
        const scoreObj = (decision.optionScores || []).find(
          (s) => s.optionId === opt.id && s.factorId === factorId
        );
        row.push(scoreObj ? scoreObj.score : 'N/A');
      });
      rows.push(row);
    });
  }

  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  const filename = `Decision_${decision.id || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename);
}

/**
 * Export single Decision details as formatted PDF
 */
export function exportDecisionToPDF(decision, userVote = null) {
  if (!decision) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(37, 99, 235); // DecisionHub primary blue
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DECISIONHUB • COLLABORATIVE DECISION REPORT', 14, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }), pageWidth - 14, 8, { align: 'right' });

  // Title
  y = 22;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(decision.title || 'Decision Report', pageWidth - 28);
  doc.text(titleLines, 14, y);
  y += titleLines.length * 8 + 2;

  // Meta Badges & Info Strip
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  const status = decision.status || 'OPEN';
  const category = decision.categoryName ? `Category: ${decision.categoryName}` : null;
  const author = decision.createdBy?.name ? `Author: ${decision.createdBy.name}` : null;
  const createdDate = decision.createdAt ? `Date: ${new Date(decision.createdAt).toLocaleDateString()}` : null;
  const metrics = `Views: ${decision.views || 0}  |  Votes: ${decision.votesCount || 0}`;

  const metaString = [status, category, author, createdDate, metrics].filter(Boolean).join('   •   ');
  doc.text(metaString, 14, y);
  y += 6;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Overview & Context', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const descText = decision.description || 'No detailed background provided.';
  const descLines = doc.splitTextToSize(descText, pageWidth - 28);
  doc.text(descLines, 14, y);
  y += descLines.length * 5 + 8;

  // Attached Poll Breakdown
  if (decision.poll && decision.poll.options && decision.poll.options.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Attached Poll & Voting Distribution', 14, y);
    y += 5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Question: "${decision.poll.question || 'Poll'}"`, 14, y);
    y += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('#', 17, y + 4.5);
    doc.text('Option Text', 26, y + 4.5);
    doc.text('Votes', 135, y + 4.5);
    doc.text('Share', 160, y + 4.5);
    y += 7;

    const totalVotes = decision.votesCount || decision.poll.options.reduce((acc, o) => acc + (o.voteCount || 0), 0);

    decision.poll.options.forEach((opt, idx) => {
      const vCount = opt.voteCount || 0;
      const pct = totalVotes > 0 ? Math.round((vCount / totalVotes) * 100) : 0;
      const isUserChoice = userVote && (Number(userVote.optionId) === Number(opt.id) || userVote.optionText === opt.optionText);

      // Alternating row background
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }

      doc.setFont('helvetica', isUserChoice ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(isUserChoice ? 37 : 51, isUserChoice ? 99 : 65, isUserChoice ? 235 : 85);

      doc.text(String(idx + 1), 17, y + 4.5);
      const optText = opt.optionText + (isUserChoice ? '  (Your Vote ✓)' : '');
      doc.text(doc.splitTextToSize(optText, 100), 26, y + 4.5);
      doc.text(String(vCount), 135, y + 4.5);
      doc.text(`${pct}%`, 160, y + 4.5);

      y += 6.5;
    });

    y += 8;
  }

  // Footer
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DecisionHub Platform • Real-Time Community Polling & Governance', 14, footerY + 4);
  doc.text(`Page 1 of 1`, pageWidth - 14, footerY + 4, { align: 'right' });

  const filename = `Decision_${decision.id || 'export'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export Creator Analytics Overview to CSV (Excel compatible)
 */
export function exportAnalyticsToCSV(analyticsData) {
  if (!analyticsData) return;

  const rows = [];
  rows.push(['DecisionHub - Creator Analytics Report']);
  rows.push(['Generated At', new Date().toLocaleString()]);
  rows.push([]);

  // KPI Summary
  rows.push(['EXECUTIVE KPI SUMMARY']);
  rows.push(['Total Decisions Published', analyticsData.totalDecisions || 0]);
  rows.push(['Total Reach (Impressions)', analyticsData.totalReach || 0]);
  rows.push(['Total Page Views', analyticsData.totalViews || 0]);
  rows.push(['Total Votes Cast', analyticsData.totalVotes || 0]);
  rows.push(['Average Votes per Poll', analyticsData.avgVotesPerPoll || '0.0']);
  rows.push(['Overall Conversion Rate', `${analyticsData.conversionRate || 0}%`]);
  rows.push(['Active Decisions', analyticsData.activeDecisions || 0]);
  rows.push(['Closed Decisions', analyticsData.closedDecisions || 0]);
  rows.push([]);

  // Decision Breakdown Table
  rows.push(['DECISION PERFORMANCE BREAKDOWN']);
  rows.push([
    'Decision ID',
    'Decision Title',
    'Status',
    'Created Date',
    'Views',
    'Total Votes',
    'Conversion (%)',
    'Leading Choice',
    'Leading Choice Votes',
  ]);

  (analyticsData.decisions || []).forEach((dec) => {
    let leadingChoice = 'N/A';
    let leadingVotes = 0;

    if (dec.poll?.options && dec.poll.options.length > 0) {
      let maxV = -1;
      dec.poll.options.forEach((o) => {
        if ((o.voteCount || 0) > maxV) {
          maxV = o.voteCount || 0;
          leadingChoice = o.optionText;
          leadingVotes = o.voteCount || 0;
        }
      });
    }

    const conversion = dec.views ? Math.round(((dec.votesCount || 0) / dec.views) * 100) : 0;

    rows.push([
      dec.id || 'N/A',
      dec.title || 'Untitled',
      dec.status || 'OPEN',
      dec.createdAt ? new Date(dec.createdAt).toLocaleDateString() : 'N/A',
      dec.views || 0,
      dec.votesCount || 0,
      `${conversion}%`,
      leadingChoice,
      leadingVotes,
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  const filename = `Creator_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename);
}

/**
 * Export Creator Analytics Overview to PDF
 */
export function exportAnalyticsToPDF(analyticsData, user = null) {
  if (!analyticsData) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DECISIONHUB • CREATOR ANALYTICS REPORT', 14, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }), pageWidth - 14, 8, { align: 'right' });

  // Title
  y = 22;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Creator Analytics Executive Summary', 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const authorText = user?.name ? `Report prepared for: ${user.name} (${user.email || ''})` : 'Creator Performance Summary';
  doc.text(authorText, 14, y);
  y += 6;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // KPI Grid Cards (4 blocks)
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const kpis = [
    { label: 'Total Reach', val: String(analyticsData.totalReach || 0), sub: 'Impressions' },
    { label: 'Page Views', val: String(analyticsData.totalViews || 0), sub: 'Direct visits' },
    { label: 'Total Votes', val: String(analyticsData.totalVotes || 0), sub: 'Votes cast' },
    { label: 'Conversion', val: `${analyticsData.conversionRate || 0}%`, sub: 'Vote rate' },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cardX, y, cardWidth, 20, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, cardWidth, 20, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), cardX + 3, y + 5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, cardX + 3, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, cardX + 3, y + 17);
  });

  y += 26;

  // Secondary Summary row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Published Decisions: ${analyticsData.totalDecisions || 0}  |  Active: ${analyticsData.activeDecisions || 0}  |  Closed: ${analyticsData.closedDecisions || 0}  |  Avg Votes/Poll: ${analyticsData.avgVotesPerPoll || '0.0'}`,
    14,
    y
  );
  y += 8;

  // Decisions Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Decisions Performance Breakdown', 14, y);
  y += 5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Title', 17, y + 4.5);
  doc.text('Status', 90, y + 4.5);
  doc.text('Views', 112, y + 4.5);
  doc.text('Votes', 128, y + 4.5);
  doc.text('Rate', 144, y + 4.5);
  doc.text('Leading Choice', 158, y + 4.5);
  y += 7;

  const decisionList = analyticsData.decisions || [];

  if (decisionList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No published decisions found.', 17, y + 5);
    y += 10;
  } else {
    decisionList.slice(0, 15).forEach((dec, idx) => {
      if (y > 270) return; // Prevent page overflow

      let leading = 'N/A';
      if (dec.poll?.options && dec.poll.options.length > 0) {
        let maxV = -1;
        dec.poll.options.forEach((o) => {
          if ((o.voteCount || 0) > maxV) {
            maxV = o.voteCount || 0;
            leading = o.optionText;
          }
        });
      }

      const conversion = dec.views ? Math.round(((dec.votesCount || 0) / dec.views) * 100) : 0;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      const titleShort = dec.title.length > 38 ? dec.title.substring(0, 36) + '...' : dec.title;
      doc.text(titleShort, 17, y + 4.5);
      doc.text(dec.status || 'OPEN', 90, y + 4.5);
      doc.text(String(dec.views || 0), 112, y + 4.5);
      doc.text(String(dec.votesCount || 0), 128, y + 4.5);
      doc.text(`${conversion}%`, 144, y + 4.5);
      const leadingShort = leading.length > 18 ? leading.substring(0, 16) + '...' : leading;
      doc.text(leadingShort, 158, y + 4.5);

      y += 6.5;
    });
  }

  // Footer
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DecisionHub Analytics Report • Generated Client-Side', 14, footerY + 4);
  doc.text(`Page 1 of 1`, pageWidth - 14, footerY + 4, { align: 'right' });

  const filename = `Creator_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export single Decision Analytics from Modal to CSV
 */
export function exportSingleDecisionAnalyticsCSV(decision) {
  if (!decision) return;
  exportDecisionToCSV(decision);
}

/**
 * Export single Decision Analytics from Modal to PDF
 */
export function exportSingleDecisionAnalyticsPDF(decision) {
  if (!decision) return;
  exportDecisionToPDF(decision);
}

/**
 * Export analytics report using Backend Eng 2's /api/analytics/reports/export endpoint
 * with graceful fallback to client-side generation.
 */
export async function exportAnalyticsReportBackendOrClient(format = 'pdf', analyticsData = null, user = null, token = null) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('decisionhub_token') : null);

  if (authToken) {
    try {
      const response = await fetch(`/api/analytics/reports/export?format=${encodeURIComponent(format)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.content) {
          const mime = format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;';
          downloadFile(data.content, data.reportName || `Analytics_Report.${format}`, mime);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend export endpoint returned error, falling back to client-side generator:', err);
    }
  }

  // Client-side fallback
  if (format === 'pdf') {
    exportAnalyticsToPDF(analyticsData, user);
  } else {
    exportAnalyticsToCSV(analyticsData);
  }
}

