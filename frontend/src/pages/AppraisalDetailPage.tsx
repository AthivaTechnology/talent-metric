import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  ArrowLeftIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { appraisalService } from '@services/appraisalService';
import { questionService } from '@services/questionService';
import { useAuth } from '@context/AuthContext';
import StatusBadge from '@components/common/StatusBadge';
import StarRating from '@components/common/StarRating';
import LoadingSpinner from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { RatingCategory, QuestionSection, Comment } from '@/types/index';
import clsx from 'clsx';

const RATING_CATEGORIES: { key: RatingCategory; label: string; desc: string }[] = [
  { key: 'technical_skills', label: 'Technical Skills', desc: 'Proficiency in relevant technologies' },
  { key: 'code_quality', label: 'Code Quality', desc: 'Clean, maintainable, well-tested code' },
  { key: 'ownership', label: 'Ownership', desc: 'Takes responsibility and drives outcomes' },
  { key: 'problem_solving', label: 'Problem Solving', desc: 'Analytical thinking and creativity' },
  { key: 'communication', label: 'Communication', desc: 'Clear, concise, collaborative communication' },
];

// Tiptap toolbar
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    clsx(
      'px-2 py-1 text-xs rounded font-medium transition-colors',
      active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
    );

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-lg flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
      >
        U
      </button>
      <div className="w-px h-4 bg-slate-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
      >
        &#8226; List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
      >
        1. List
      </button>
      <div className="w-px h-4 bg-slate-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
      >
        L
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
      >
        C
      </button>
    </div>
  );
}

// Single rich text answer editor
interface AnswerEditorProps {
  questionId: string;
  questionText: string;
  initialValue: string;
  onChange: (questionId: string, html: string) => void;
}

function AnswerEditor({ questionId, questionText, initialValue, onChange }: AnswerEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Write your answer here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialValue || '',
    onUpdate: ({ editor: e }) => {
      onChange(questionId, e.getHTML());
    },
  });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{questionText}</p>
      <div className="border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
        <EditorToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className="tiptap-editor min-h-[100px] focus:outline-none"
        />
      </div>
    </div>
  );
}

// Comment item
function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center">
        {comment.user?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-900">{comment.user?.name}</span>
          <span className="text-xs text-slate-400 capitalize">
            {comment.user?.role?.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">
            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{comment.comment}</p>
      </div>
    </div>
  );
}

// Advance stage button labels
const ADVANCE_LABELS: Record<string, string> = {
  draft: 'Submit Appraisal',
  submitted: 'Move to Tech Lead Review',
  tech_lead_review: 'Move to Manager Review',
  manager_review: 'Mark as Completed',
};

export default function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    technical_skills: 0,
    code_quality: 0,
    ownership: 0,
    problem_solving: 0,
    communication: 0,
  });
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const appraisalQuery = useQuery(
    ['appraisal', id],
    () => appraisalService.getAppraisalById(id!),
    { enabled: !!id }
  );

  const questionsQuery = useQuery(['questions'], questionService.getQuestions, {
    staleTime: 300_000,
  });

  const commentsQuery = useQuery(
    ['appraisal-comments', id],
    () => appraisalService.getComments(id!),
    { enabled: !!id }
  );

  const appraisal = appraisalQuery.data;
  const sections: QuestionSection[] = questionsQuery.data ?? [];

  // Initialize state from appraisal data
  useEffect(() => {
    if (!appraisal) return;

    const answerMap: Record<string, string> = {};
    appraisal.responses.forEach((r) => {
      answerMap[r.questionId] = r.answer;
    });
    setAnswers(answerMap);

    const ratingMap = { ...ratings };
    appraisal.ratings.forEach((r) => {
      ratingMap[r.category] = r.rating;
    });
    setRatings(ratingMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appraisal?.id]);

  const saveMutation = useMutation(
    () =>
      appraisalService.updateAppraisal(id!, {
        responses: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        ratings: Object.entries(ratings).map(([category, rating]) => ({
          category: category as RatingCategory,
          rating,
        })),
      }),
    {
      onSuccess: () => {
        toast.success('Saved successfully');
        queryClient.invalidateQueries(['appraisal', id]);
      },
      onError: () => { toast.error('Failed to save'); },
    }
  );

  const submitMutation = useMutation(
    () => appraisalService.submitAppraisal(id!),
    {
      onSuccess: (updated) => {
        toast.success(`Status updated to "${updated.status.replace('_', ' ')}"`);
        queryClient.invalidateQueries(['appraisal', id]);
        queryClient.invalidateQueries(['appraisals']);
      },
      onError: () => { toast.error('Failed to advance workflow'); },
    }
  );

  const commentMutation = useMutation(
    () => appraisalService.addComment(id!, newComment),
    {
      onSuccess: () => {
        toast.success('Comment added');
        setNewComment('');
        queryClient.invalidateQueries(['appraisal-comments', id]);
      },
      onError: () => { toast.error('Failed to add comment'); },
    }
  );

  const handleSave = async () => {
    setIsSaving(true);
    await saveMutation.mutateAsync().finally(() => setIsSaving(false));
  };

  const handleAnswerChange = (questionId: string, html: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: html }));
  };

  const handleRatingChange = (category: RatingCategory, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  if (appraisalQuery.isLoading || questionsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner label="Loading appraisal..." />
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="text-center py-16 text-slate-500">
        Appraisal not found.
      </div>
    );
  }

  const isDraft = appraisal.status === 'draft';
  const isCompleted = appraisal.status === 'completed';
  const isDeveloper = user?.role === 'developer';
  const canEdit = isDeveloper && isDraft;
  const canAdvance =
    !isCompleted &&
    ((isDeveloper && isDraft) ||
      (user?.role === 'tech_lead' &&
        (appraisal.status === 'submitted' || appraisal.status === 'tech_lead_review')) ||
      (user?.role === 'manager' && appraisal.status === 'manager_review') ||
      user?.role === 'admin');

  const advanceLabel = ADVANCE_LABELS[appraisal.status] ?? 'Advance';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Appraisals
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {appraisal.user?.name ?? 'My'} Appraisal — {appraisal.year}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={appraisal.status} />
            {appraisal.deadline && (
              <span className="text-sm text-slate-500">
                Due {format(new Date(appraisal.deadline), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: questionnaire / readonly view */}
        <div className="lg:col-span-3 space-y-6">

          {/* Section tabs */}
          {sections.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {sections.map((sec, idx) => (
                <button
                  key={sec.section}
                  onClick={() => setActiveSection(idx)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    activeSection === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {sec.sectionTitle}
                </button>
              ))}
            </div>
          )}

          {/* Section questions */}
          {sections.map((sec, idx) => (
            <div
              key={sec.section}
              className={clsx('card', activeSection !== idx && 'hidden')}
            >
              <div className="card-header">
                <h2 className="text-base font-semibold text-slate-900">{sec.sectionTitle}</h2>
              </div>
              <div className="card-body space-y-6">
                {sec.questions.map((q) => (
                  <div key={q.id}>
                    {canEdit ? (
                      <AnswerEditor
                        questionId={q.id}
                        questionText={q.questionText}
                        initialValue={answers[q.id] ?? ''}
                        onChange={handleAnswerChange}
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-800">{q.questionText}</p>
                        <div
                          className="prose-content p-3 bg-slate-50 rounded-lg min-h-[60px] text-sm"
                          dangerouslySetInnerHTML={{
                            __html: answers[q.id] || '<p class="text-slate-400">No answer provided</p>',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* If no sections loaded */}
          {sections.length === 0 && (
            <div className="card card-body text-center text-slate-400 text-sm py-12">
              No questions available.
            </div>
          )}

          {/* Self-ratings */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-base font-semibold text-slate-900">Self Ratings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Rate yourself honestly on each dimension (1–5)</p>
            </div>
            <div className="card-body divide-y divide-slate-100">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cat.label}</p>
                    <p className="text-xs text-slate-500">{cat.desc}</p>
                  </div>
                  <StarRating
                    value={ratings[cat.key]}
                    onChange={canEdit ? (v) => handleRatingChange(cat.key, v) : undefined}
                    readonly={!canEdit}
                    size="md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save button for developer in draft */}
          {canEdit && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-secondary"
              >
                {isSaving ? <LoadingSpinner size="sm" /> : 'Save Draft'}
              </button>
            </div>
          )}
        </div>

        {/* Right: actions + comments */}
        <div className="space-y-4">
          {/* Action panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">Workflow</h3>
            </div>
            <div className="card-body space-y-3">
              <div className="space-y-2">
                {(['draft', 'submitted', 'tech_lead_review', 'manager_review', 'completed'] as const).map(
                  (stage) => (
                    <div key={stage} className="flex items-center gap-2">
                      <div
                        className={clsx(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          appraisal.status === stage
                            ? 'bg-indigo-600'
                            : ['draft', 'submitted', 'tech_lead_review', 'manager_review', 'completed'].indexOf(stage) <
                                ['draft', 'submitted', 'tech_lead_review', 'manager_review', 'completed'].indexOf(appraisal.status)
                            ? 'bg-green-500'
                            : 'bg-slate-300'
                        )}
                      />
                      <span
                        className={clsx(
                          'text-xs capitalize',
                          appraisal.status === stage
                            ? 'text-indigo-700 font-semibold'
                            : 'text-slate-500'
                        )}
                      >
                        {stage.replace('_', ' ')}
                      </span>
                      {appraisal.status === stage && (
                        <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-600 ml-auto" />
                      )}
                    </div>
                  )
                )}
              </div>

              {canAdvance && (
                <button
                  onClick={() => {
                    if (canEdit) {
                      // Save first, then submit
                      saveMutation
                        .mutateAsync()
                        .then(() => submitMutation.mutate())
                        .catch(() => {});
                    } else {
                      submitMutation.mutate();
                    }
                  }}
                  disabled={submitMutation.isLoading || saveMutation.isLoading}
                  className="btn-primary w-full mt-2"
                >
                  {submitMutation.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      {advanceLabel}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Developer info */}
          {appraisal.user && !isDeveloper && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-slate-900">Developer</h3>
              </div>
              <div className="card-body space-y-1">
                <p className="text-sm font-medium text-slate-900">{appraisal.user.name}</p>
                <p className="text-xs text-slate-500">{appraisal.user.email}</p>
              </div>
            </div>
          )}

          {/* Comments panel */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
            </div>
            <div className="card-body space-y-4">
              {commentsQuery.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : commentsQuery.data?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {commentsQuery.data?.map((c) => (
                    <CommentItem key={c.id} comment={c} />
                  ))}
                </div>
              )}

              {!isCompleted && !isDeveloper && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                  <button
                    onClick={() => commentMutation.mutate()}
                    disabled={!newComment.trim() || commentMutation.isLoading}
                    className="btn-primary btn-sm w-full"
                  >
                    {commentMutation.isLoading ? <LoadingSpinner size="sm" /> : 'Add Comment'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
