import { verifyAndTestEmail } from '../services/emailService.js';
import {
  generateCsvBuffer,
  generateXlsxBuffer,
  querySubmissionsForExport,
} from '../services/exportService.js';
import { testGoogleSheetsConnection } from '../services/googleSheetsService.js';
import {
  getIntegrationStatusSummary,
  retryFailedJobsByType,
  retrySubmissionJobs,
} from '../services/syncWorker.js';

export async function getIntegrationsStatus(_req, res) {
  try {
    const status = await getIntegrationStatusSummary();
    return res.status(200).json({ success: true, ...status });
  } catch (err) {
    console.error('[INTEGRATIONS] Status error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to load integration status.',
    });
  }
}

export async function testEmailIntegration(req, res) {
  try {
    const sendTestMessage = Boolean(req.body?.sendTestMessage);
    const result = await verifyAndTestEmail({ sendTestMessage });
    return res.status(result.ok ? 200 : 400).json({
      success: result.ok,
      ...result,
    });
  } catch (err) {
    console.error('[INTEGRATIONS] Test email error:', err?.message || 'Unknown error');
    return res.status(502).json({
      success: false,
      message: err?.message || 'Email verification failed.',
    });
  }
}

export async function testSheetsIntegration(_req, res) {
  try {
    const result = await testGoogleSheetsConnection();
    return res.status(result.ok ? 200 : 400).json({
      success: result.ok,
      ...result,
    });
  } catch (err) {
    console.error('[INTEGRATIONS] Test sheets error:', err?.message || 'Unknown error');
    return res.status(502).json({
      success: false,
      message: err?.message || 'Google Sheets connection failed.',
    });
  }
}

export async function retrySubmissionSheetsSync(req, res) {
  try {
    const result = await retrySubmissionJobs(req.params.sid, ['google_sheets']);
    if (!result.ok) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, outbox: result.outbox });
  } catch (err) {
    console.error('[INTEGRATIONS] Retry sheets error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to retry Google Sheets sync.',
    });
  }
}

export async function retrySubmissionEmails(req, res) {
  try {
    const result = await retrySubmissionJobs(req.params.sid, [
      'admin_email',
      'member_email',
    ]);
    if (!result.ok) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, outbox: result.outbox });
  } catch (err) {
    console.error('[INTEGRATIONS] Retry email error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to retry email notifications.',
    });
  }
}

export async function retryAllFailedEmails(_req, res) {
  try {
    const result = await retryFailedJobsByType(['admin_email', 'member_email']);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[INTEGRATIONS] Retry failed emails error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to retry failed emails.',
    });
  }
}

export async function retryAllFailedSheets(_req, res) {
  try {
    const result = await retryFailedJobsByType(['google_sheets']);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[INTEGRATIONS] Retry failed sheets error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to retry failed Google Sheets jobs.',
    });
  }
}

export async function exportSubmissions(req, res) {
  try {
    const format = String(req.query.format || 'csv').trim().toLowerCase();
    if (format !== 'csv' && format !== 'xlsx') {
      return res.status(400).json({
        success: false,
        message: 'Export format must be "csv" or "xlsx".',
      });
    }

    const submissions = await querySubmissionsForExport({
      month: req.query.month,
      city: req.query.city,
      rs: req.query.rs,
      from: req.query.from,
      to: req.query.to,
    });

    const dateTag = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const buffer = generateCsvBuffer(submissions);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ghf-assessments-${dateTag}.csv"`
      );
      return res.status(200).send(buffer);
    }

    const buffer = await generateXlsxBuffer(submissions);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ghf-assessments-${dateTag}.xlsx"`
    );
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('[EXPORT] Export failed:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to generate export file.',
    });
  }
}
