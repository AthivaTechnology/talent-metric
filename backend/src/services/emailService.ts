import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const FROM = process.env.SMTP_FROM || `"Talent Metric" <${process.env.SMTP_USER}>`;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Only send emails if SMTP is configured
const isConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

async function send(to: string, subject: string, html: string) {
  if (!isConfigured()) return;
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

function appraisalLink(appraisalId: number) {
  return `${APP_URL}/appraisals/${appraisalId}`;
}

function baseLayout(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
      <div style="background:#4F46E5;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:20px">Talent Metric</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        ${content}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p style="font-size:12px;color:#9ca3af;margin:0">This is an automated notification from Talent Metric.</p>
      </div>
    </div>`;
}

function btn(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">${label}</a>`;
}

// 1. Developer submitted → notify tech lead
export async function notifyTechLeadOnSubmit(opts: {
  techLeadEmail: string;
  techLeadName: string;
  developerName: string;
  appraisalId: number;
  year: number;
}) {
  await send(
    opts.techLeadEmail,
    `Appraisal submitted for review — ${opts.developerName}`,
    baseLayout(`
      <h3 style="margin-top:0">New Appraisal Submitted</h3>
      <p><strong>${opts.developerName}</strong> has submitted their ${opts.year} appraisal for your review.</p>
      ${btn(appraisalLink(opts.appraisalId), 'Review Appraisal')}
    `)
  );
}

// 2. Tech lead forwarded → notify manager
export async function notifyManagerOnTechLeadReview(opts: {
  managerEmail: string;
  managerName: string;
  developerName: string;
  techLeadName: string;
  appraisalId: number;
  year: number;
}) {
  await send(
    opts.managerEmail,
    `Appraisal ready for manager review — ${opts.developerName}`,
    baseLayout(`
      <h3 style="margin-top:0">Appraisal Ready for Your Review</h3>
      <p><strong>${opts.developerName}</strong>'s ${opts.year} appraisal has been reviewed by <strong>${opts.techLeadName}</strong> and is now awaiting your final review.</p>
      ${btn(appraisalLink(opts.appraisalId), 'Review Appraisal')}
    `)
  );
}

// 3. Manager completed → notify developer
export async function notifyDeveloperOnComplete(opts: {
  developerEmail: string;
  developerName: string;
  managerName: string;
  appraisalId: number;
  year: number;
}) {
  await send(
    opts.developerEmail,
    `Your ${opts.year} appraisal has been completed`,
    baseLayout(`
      <h3 style="margin-top:0">Appraisal Completed</h3>
      <p>Hi <strong>${opts.developerName}</strong>,</p>
      <p>Your ${opts.year} appraisal has been completed and signed off by <strong>${opts.managerName}</strong>.</p>
      ${btn(appraisalLink(opts.appraisalId), 'View Appraisal')}
    `)
  );
}

// 4. Appraisal returned → notify developer
export async function notifyDeveloperOnReturn(opts: {
  developerEmail: string;
  developerName: string;
  reviewerName: string;
  appraisalId: number;
  year: number;
  reason?: string;
}) {
  await send(
    opts.developerEmail,
    `Your ${opts.year} appraisal has been returned for revision`,
    baseLayout(`
      <h3 style="margin-top:0">Appraisal Returned for Revision</h3>
      <p>Hi <strong>${opts.developerName}</strong>,</p>
      <p>Your ${opts.year} appraisal has been returned for revision by <strong>${opts.reviewerName}</strong>.</p>
      ${opts.reason ? `<blockquote style="border-left:4px solid #e5e7eb;padding:8px 16px;margin:16px 0;color:#6b7280">${opts.reason}</blockquote>` : ''}
      <p>Please review the feedback and resubmit.</p>
      ${btn(appraisalLink(opts.appraisalId), 'Update Appraisal')}
    `)
  );
}

// 5. Appraisal opened — notify the appraisee
export async function notifyAppraiseeOnOpen(opts: {
  appraiseeEmail: string;
  appraiseeName: string;
  appraisalId: number;
  year: number;
  deadline?: Date | null;
  invitationToken?: string;
}) {
  const deadlineNote = opts.deadline
    ? `<p>Please complete it by <strong>${opts.deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>`
    : '';

  const actionUrl = opts.invitationToken
    ? `${APP_URL}/accept-invite?token=${opts.invitationToken}&redirect=/appraisals/${opts.appraisalId}`
    : appraisalLink(opts.appraisalId);
  const actionLabel = opts.invitationToken ? 'Set Password &amp; Start Appraisal' : 'Start Appraisal';

  const inviteNote = opts.invitationToken
    ? `<p style="color:#6b7280;font-size:14px">You'll be asked to set a password before accessing your appraisal. This link is valid for 30 days.</p>`
    : '';

  await send(
    opts.appraiseeEmail,
    `Your ${opts.year} appraisal is now open`,
    baseLayout(`
      <h3 style="margin-top:0">Your ${opts.year} Appraisal is Ready</h3>
      <p>Hi <strong>${opts.appraiseeName}</strong>,</p>
      <p>Your ${opts.year} self-assessment appraisal has been opened and is ready for you to fill in.</p>
      ${deadlineNote}
      ${inviteNote}
      ${btn(actionUrl, actionLabel)}
    `)
  );
}

// 6. Comment added — notify the appraisee (if comment is from reviewer) or the reviewer (if reply from appraisee)
export async function notifyOnComment(opts: {
  recipientEmail: string;
  recipientName: string;
  commenterName: string;
  appraisalId: number;
  year: number;
  stage: string;
}) {
  const label = opts.stage === 'developer_reply' ? 'replied to a comment on' : 'left a comment on';
  await send(
    opts.recipientEmail,
    `New comment on ${opts.year} appraisal`,
    baseLayout(`
      <h3 style="margin-top:0">New Comment</h3>
      <p>Hi <strong>${opts.recipientName}</strong>,</p>
      <p><strong>${opts.commenterName}</strong> has ${label} an appraisal.</p>
      ${btn(appraisalLink(opts.appraisalId), 'View Comment')}
    `)
  );
}
