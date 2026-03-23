import {
  BookOpenIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="prose prose-slate max-w-none">{children}</div>
    </section>
  );
}

export default function UserManualPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Manual</h1>
        <p className="text-slate-500 mt-1">
          Complete guide to using the Talent Metric Developer Appraisal System
        </p>
      </div>

      {/* Table of contents */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { label: 'Introduction', href: '#introduction' },
            { label: 'Getting Started', href: '#getting-started' },
            { label: 'User Roles', href: '#user-roles' },
            { label: 'Appraisal Workflow', href: '#workflow' },
            { label: 'Developer Guide', href: '#developer-guide' },
            { label: 'Tech Lead Guide', href: '#tech-lead-guide' },
            { label: 'Manager Guide', href: '#manager-guide' },
            { label: 'Admin Guide', href: '#admin-guide' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Introduction */}
      <Section id="introduction" title="Introduction" icon={BookOpenIcon}>
        <p className="text-slate-600 mb-4">
          Talent Metric is a comprehensive developer appraisal system designed to streamline the
          annual performance review process. It provides a structured multi-stage workflow where
          developers complete self-assessments, tech leads provide feedback, and managers finalize
          reviews.
        </p>
        <h4 className="font-semibold text-slate-900 mb-2">Key Benefits</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
          <li>
            <strong>Structured Self-Assessment:</strong> 7 comprehensive sections covering all
            aspects of developer performance
          </li>
          <li>
            <strong>Multi-Stage Review:</strong> Ensures thorough evaluation with multiple reviewers
          </li>
          <li>
            <strong>Auto-Save:</strong> Never lose your work with automatic draft saving
          </li>
          <li>
            <strong>Real-Time Progress Tracking:</strong> Monitor appraisal status at every stage
          </li>
          <li>
            <strong>Analytics Dashboard:</strong> Data-driven insights for managers and admins
          </li>
        </ul>
      </Section>

      {/* Getting Started */}
      <Section id="getting-started" title="Getting Started" icon={CogIcon}>
        <h4 className="font-semibold text-slate-900 mb-2">First-Time Login (Invite Flow)</h4>
        <ol className="list-decimal list-inside text-slate-600 space-y-1 mb-4">
          <li>When your appraisal is opened, you'll receive an email with a <strong>Set Password &amp; Start Appraisal</strong> link</li>
          <li>Click the link to set your password — the link is valid for <strong>30 days</strong></li>
          <li>After setting your password, you'll be taken directly to your appraisal</li>
          <li>For future logins, navigate to the app URL and sign in with your email and password</li>
        </ol>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Interns are not part of the appraisal process and will not receive an invite.
          </p>
        </div>
        <h4 className="font-semibold text-slate-900 mb-2">Password Requirements</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Minimum 8 characters</li>
          <li>At least one uppercase letter, one lowercase letter, one number, and one special character</li>
        </ul>
      </Section>

      {/* User Roles */}
      <Section id="user-roles" title="User Roles" icon={UserIcon}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Key Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Developer</td>
                <td className="px-4 py-3 text-slate-600">Team members who complete self-assessments</td>
                <td className="px-4 py-3 text-slate-600">Fill appraisals, view own status</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Tester</td>
                <td className="px-4 py-3 text-slate-600">QA team members — same workflow as Developers</td>
                <td className="px-4 py-3 text-slate-600">Fill appraisals, view own status</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">DevOps</td>
                <td className="px-4 py-3 text-slate-600">DevOps engineers — same workflow as Developers</td>
                <td className="px-4 py-3 text-slate-600">Fill appraisals, view own status</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Tech Lead</td>
                <td className="px-4 py-3 text-slate-600">Senior developers who review their team's appraisals</td>
                <td className="px-4 py-3 text-slate-600">Review team appraisals, add feedback, own appraisal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Manager</td>
                <td className="px-4 py-3 text-slate-600">Team managers who finalize reviews</td>
                <td className="px-4 py-3 text-slate-600">Final review, complete appraisals, view analytics, own appraisal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Admin</td>
                <td className="px-4 py-3 text-slate-600">System administrators</td>
                <td className="px-4 py-3 text-slate-600">User management, bulk create appraisals, view appraisal list (not detail)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Appraisal Workflow */}
      <Section id="workflow" title="Appraisal Workflow" icon={ClipboardDocumentListIcon}>
        <div className="bg-slate-50 rounded-lg p-4 mb-4 font-mono text-sm">
          <div className="space-y-2 text-slate-700">
            <p>1. DRAFT &rarr; Developer fills self-assessment (auto-save enabled)</p>
            <p>2. SUBMITTED &rarr; Developer submits to Tech Lead</p>
            <p>3. TECH_LEAD_REVIEW &rarr; Tech Lead reviews and adds comments, forwards to Manager</p>
            <p>4. MANAGER_REVIEW &rarr; Manager performs final review and marks complete</p>
            <p>5. COMPLETED &rarr; Appraisal is finalized</p>
          </div>
        </div>
        <h4 className="font-semibold text-slate-900 mb-2">Status Indicators</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Color</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Draft</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Gray</span></td>
                <td className="px-4 py-3 text-slate-600">Work in progress</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Submitted</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Blue</span></td>
                <td className="px-4 py-3 text-slate-600">Awaiting Tech Lead review</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Tech Lead Review</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Yellow</span></td>
                <td className="px-4 py-3 text-slate-600">Under Tech Lead review</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Manager Review</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Purple</span></td>
                <td className="px-4 py-3 text-slate-600">Under Manager review</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Completed</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Green</span></td>
                <td className="px-4 py-3 text-slate-600">Finalized</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Developer Guide */}
      <Section id="developer-guide" title="Developer Guide" icon={UserIcon}>
        <h4 className="font-semibold text-slate-900 mb-2">Appraisal Form - 7 Sections (29 questions total)</h4>
        <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-4">
          <li><strong>Achievements & Impact</strong> (5 questions) - Top contributions, measurable impact, challenging tasks</li>
          <li><strong>Technical Skills</strong> (5 questions) - New skills learned, areas for improvement</li>
          <li><strong>Code Quality & Engineering Practices</strong> (4 questions) - Code quality, code reviews, refactoring</li>
          <li><strong>Ownership & Responsibility</strong> (4 questions) - Taking ownership, handling production issues</li>
          <li><strong>Communication & Collaboration</strong> (4 questions) - Team collaboration, knowledge sharing</li>
          <li><strong>Leadership & Mentorship</strong> (3 questions) - Leadership examples, mentoring others</li>
          <li><strong>Goals & Growth</strong> (4 questions) - Previous goals progress, next year objectives</li>
        </ol>
        <h4 className="font-semibold text-slate-900 mb-2">Tips for Completing Your Appraisal</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Be specific with examples and metrics where possible</li>
          <li>Use the auto-save feature - your work is saved automatically</li>
          <li>Review all sections before submitting</li>
          <li>Once submitted, you cannot edit until returned by a reviewer</li>
        </ul>
      </Section>

      {/* Tech Lead Guide */}
      <Section id="tech-lead-guide" title="Tech Lead Guide" icon={UserIcon}>
        <h4 className="font-semibold text-slate-900 mb-2">Reviewing Appraisals</h4>
        <ol className="list-decimal list-inside text-slate-600 space-y-1 mb-4">
          <li>Navigate to the Team page to see pending reviews</li>
          <li>Click on an appraisal to open the detail view</li>
          <li>Review each section and add your comments</li>
          <li>Provide ratings for each category (1-5 scale)</li>
          <li>Forward to Manager or return to Developer for revisions</li>
        </ol>
        <h4 className="font-semibold text-slate-900 mb-2">Rating Guidelines</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li><strong>1 - Needs Improvement:</strong> Performance below expectations</li>
          <li><strong>2 - Developing:</strong> Partially meeting expectations</li>
          <li><strong>3 - Meets Expectations:</strong> Solid, consistent performance</li>
          <li><strong>4 - Exceeds Expectations:</strong> Above average contribution</li>
          <li><strong>5 - Outstanding:</strong> Exceptional performance</li>
        </ul>
      </Section>

      {/* Manager Guide */}
      <Section id="manager-guide" title="Manager Guide" icon={ChartBarIcon}>
        <h4 className="font-semibold text-slate-900 mb-2">Final Review Process</h4>
        <ol className="list-decimal list-inside text-slate-600 space-y-1 mb-4">
          <li>Review the developer's self-assessment</li>
          <li>Review the Tech Lead's comments and ratings</li>
          <li>Add your own comments and final ratings</li>
          <li>Mark the appraisal as complete or return for revisions</li>
        </ol>
        <h4 className="font-semibold text-slate-900 mb-2">Analytics Dashboard</h4>
        <p className="text-slate-600 mb-2">
          Managers have access to the Analytics page which provides:
        </p>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Team performance overview</li>
          <li>Average ratings by category</li>
          <li>Completion status tracking</li>
          <li>Historical comparison data</li>
        </ul>
      </Section>

      {/* Admin Guide */}
      <Section id="admin-guide" title="Admin Guide" icon={CogIcon}>
        <h4 className="font-semibold text-slate-900 mb-2">User Management</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
          <li>Navigate to the Users page from the sidebar</li>
          <li>Create new users with the "Add User" button</li>
          <li>Edit user details, roles, and team assignments</li>
          <li>Deactivate users who have left the organization</li>
        </ul>
        <h4 className="font-semibold text-slate-900 mb-2">Opening Appraisals</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
          <li>Use <strong>Bulk Create</strong> on the Appraisals page to open appraisals for all eligible users at once</li>
          <li>Users without a password will automatically receive a <strong>Set Password &amp; Start Appraisal</strong> invite email</li>
          <li>Managers without a manager assigned above them are excluded from the appraisal cycle</li>
          <li>Interns are not included in the appraisal process</li>
        </ul>
        <h4 className="font-semibold text-slate-900 mb-2">Admin Appraisal Access</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
          <li>Admins can view the full list of all appraisals across the organisation</li>
          <li>Admins cannot open the detail view of another user's appraisal</li>
        </ul>
        <h4 className="font-semibold text-slate-900 mb-2">Other Actions</h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Configure appraisal deadlines and set the year</li>
          <li>Export appraisal data as CSV for reporting</li>
        </ul>
      </Section>

      {/* FAQ */}
      <Section id="faq" title="Frequently Asked Questions" icon={QuestionMarkCircleIcon}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Can I edit my appraisal after submitting?</h4>
            <p className="text-slate-600">
              No, once submitted you cannot edit until a reviewer returns it to you for revisions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">How often is auto-save triggered?</h4>
            <p className="text-slate-600">
              Auto-save triggers automatically as you type, typically every few seconds after you stop typing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Who can see my appraisal?</h4>
            <p className="text-slate-600">
              Your appraisal detail is visible to you, your assigned Tech Lead, and your Manager. Admins can see the appraisal list overview but cannot open individual appraisal details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">What happens if I miss the deadline?</h4>
            <p className="text-slate-600">
              Contact your manager or admin to request a deadline extension if needed.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">How do I change my password?</h4>
            <p className="text-slate-600">
              Go to your Profile page and use the "Change Password" option.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
