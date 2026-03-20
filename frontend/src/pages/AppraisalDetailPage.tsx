import { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowUturnLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { appraisalService } from '@services/appraisalService';
import { getErrorMessage } from '@services/api';
import { questionService } from '@services/questionService';
import { useAuth } from '@context/AuthContext';
import StatusBadge from '@components/common/StatusBadge';
import StarRating from '@components/common/StarRating';
import LoadingSpinner from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { RatingCategory, QuestionSection, Comment } from '@/types/index';
import { getRatingConfig } from '@/types/index';
import clsx from 'clsx';


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

  // Sync editor content when initialValue is updated externally (e.g. fresh data loaded
  // after navigation). emitUpdate=false prevents triggering onUpdate → no feedback loop.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() !== initialValue) {
      editor.commands.setContent(initialValue || '', false);
    }
  }, [initialValue, editor]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{questionText}</p>
      <div
        className="border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden cursor-text"
        onClick={() => editor?.commands.focus()}
      >
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
function CommentItem({ comment, compact }: { comment: Comment; compact?: boolean }) {
  return (
    <div className={clsx('flex gap-2', compact ? 'gap-2' : 'gap-3')}>
      <div className={clsx(
        'flex-shrink-0 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center',
        compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
      )}>
        {comment.user?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={clsx('font-medium text-slate-900', compact ? 'text-xs' : 'text-sm')}>{comment.user?.name}</span>
          <span className="text-xs text-slate-400 capitalize">
            {comment.user?.role?.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">
            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        <p className={clsx('text-slate-700 bg-slate-50 rounded-lg px-3 py-2', compact ? 'text-xs' : 'text-sm')}>{comment.comment}</p>
      </div>
    </div>
  );
}

interface QuestionCommentThreadProps {
  questionId: string;
  comments: Comment[];
  isOpen: boolean;
  draft: string;
  isSubmitting: boolean;
  onToggle: () => void;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
}

function QuestionCommentThread({
  questionId: _questionId,
  comments,
  isOpen,
  draft,
  isSubmitting,
  onToggle,
  onDraftChange,
  onSubmit,
}: QuestionCommentThreadProps) {
  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
        {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? '' : 's'}` : 'Add comment'}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} compact />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Add a comment... (min 10 characters)"
              rows={2}
              className="input resize-none text-xs flex-1"
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={draft.trim().length < 10 || isSubmitting}
              className="btn-primary btn-sm self-end"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getDeadlineBadge(deadline: string, isCompleted: boolean): 'overdue' | 'due-soon' | null {
  if (isCompleted) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due-soon';
  return null;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Below Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
};

// Advance stage button labels
const ADVANCE_LABELS: Record<string, string> = {
  draft: 'Submit Appraisal',
  tech_lead_review: 'Move to Manager Review',
  manager_review: 'Mark as Completed',
};

export default function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [techLeadRatings, setTechLeadRatings] = useState<Record<string, number>>({});
  const [reviewerRatings, setReviewerRatings] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState('');
  const [openQuestionComments, setOpenQuestionComments] = useState<Record<string, boolean>>({});
  const [questionCommentDrafts, setQuestionCommentDrafts] = useState<Record<string, string>>({});
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [answersAutoSave, setAnswersAutoSave] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [managerFeedback, setManagerFeedback] = useState('');
  const [managerConsolidatedRating, setManagerConsolidatedRating] = useState<number>(0);
  const [feedbackAutoSave, setFeedbackAutoSave] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const canReviewRatingsRef = useRef(false);
  const canEditFeedbackRef = useRef(false);
  const canEditRef = useRef(false);
  const isInitializedRef = useRef(false);
  // Tracks which appraisal ID we've initialized for this mount (null = not yet done).
  // Prevents re-initialization when invalidateQueries triggers a background refetch while
  // the user is actively editing. Resets to null on every remount (new component instance).
  const mountInitDoneForRef = useRef<string | null>(null);
  // Always-current refs used by the flush-on-unmount effect.
  const latestAnswersRef = useRef<Record<string, string>>({});
  const latestRatingsRef = useRef<Record<string, number>>({});

  const appraisalQuery = useQuery(
    ['appraisal', id],
    () => appraisalService.getAppraisalById(id!),
    { enabled: !!id }
  );

  const appraiseeRole = appraisalQuery.data?.user?.role;
  const questionsQuery = useQuery(
    ['questions', appraiseeRole],
    () => questionService.getQuestions(appraiseeRole),
    { staleTime: 300_000, enabled: !!appraiseeRole }
  );

  const commentsQuery = useQuery(
    ['appraisal-comments', id],
    () => appraisalService.getComments(id!),
    { enabled: !!id }
  );


  const appraisal = appraisalQuery.data;
  const sections: QuestionSection[] = questionsQuery.data ?? [];

  // Which sections have at least one unanswered question (only relevant when developer can edit)
  const hasText = (html: string | undefined) => !!html && html.replace(/<[^>]*>/g, '').trim().length > 0;
  const incompleteSections = useMemo(
    () => new Set(sections.filter((sec) => sec.questions.some((q) => !hasText(answers[q.id]))).map((sec) => sec.section)),
    [sections, answers]
  );

  // Clear the cache on unmount so navigating back always fetches fresh data from the server.
  // Without this, React Query serves the stale cache immediately on remount (isFetching=false
  // on the first render) and the init effect below fires before the background fetch starts,
  // causing the UI to show the pre-edit snapshot even though the server has newer data.
  useEffect(() => {
    return () => {
      queryClient.removeQueries(['appraisal', id]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Initialize state from appraisal data.
  // appraisal?.id goes undefined → X on first load (cache cleared on unmount guarantees
  // we always get fresh server data before this runs).
  useEffect(() => {
    if (!appraisal) return;
    if (mountInitDoneForRef.current === String(appraisal.id)) return;
    mountInitDoneForRef.current = String(appraisal.id);
    isInitializedRef.current = false;

    const answerMap: Record<string, string> = {};
    appraisal.responses.forEach((r) => {
      answerMap[r.questionId] = r.answer;
    });
    setAnswers(answerMap);

    const selfMap: Record<string, number> = {};
    const tlMap: Record<string, number> = {};
    const managerMap: Record<string, number> = {};
    appraisal.ratings.forEach((r) => {
      if (!r.raterRole || r.raterRole === 'self') selfMap[r.category] = r.rating;
      else if (r.raterRole === 'tech_lead') tlMap[r.category] = r.rating;
      else if (r.raterRole === 'manager') managerMap[r.category] = r.rating;
    });
    setRatings(selfMap);
    setTechLeadRatings(tlMap);
    // Seed reviewer input from previously saved ratings matching the viewer's role
    // Admin uses managerMap so completed view shows manager ratings in the reviewer slot (not TL again)
    setReviewerRatings(user?.role === 'manager' || user?.role === 'admin' ? managerMap : tlMap);
    // Initialize manager feedback and consolidated rating
    setManagerFeedback(appraisal.managerFeedback ?? '');
    setManagerConsolidatedRating(appraisal.consolidatedRating ?? 0);
    setAiSummary(appraisal.aiSummary ?? null);
    // Mark as initialized after a tick so auto-save effects don't fire on load
    setTimeout(() => { isInitializedRef.current = true; }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appraisal?.id]);

  // Keep latest-value refs in sync so the flush-on-unmount closure always has fresh data.
  useEffect(() => { latestAnswersRef.current = answers; }, [answers]);
  useEffect(() => { latestRatingsRef.current = ratings; }, [ratings]);

  // Flush unsaved answers/ratings to the server immediately when the component unmounts.
  // This prevents losing changes when the user navigates away before the 2-second debounce fires.
  useEffect(() => {
    return () => {
      if (!canEditRef.current || !isInitializedRef.current || !id) return;
      appraisalService.updateAppraisal(id, {
        responses: Object.entries(latestAnswersRef.current).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        ratings: Object.entries(latestRatingsRef.current).map(([category, rating]) => ({
          category: category as RatingCategory,
          rating: rating as number,
        })),
      }).catch(() => { /* best-effort flush — ignore errors on unmount */ });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveMutation = useMutation(
    () =>
      appraisalService.updateAppraisal(id!, {
        responses: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        ratings: Object.entries(ratings).map(([category, rating]) => ({
          category: category as RatingCategory,
          rating: rating as number,
        })),
      }),
    {
      onSuccess: () => {
        toast.success('Saved successfully');
        queryClient.invalidateQueries(['appraisal', id]);
      },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to save')); },
    }
  );

  // Silent auto-save — no toast, uses same payload as saveMutation
  const autoSaveMutation = useMutation(
    () =>
      appraisalService.updateAppraisal(id!, {
        responses: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        ratings: Object.entries(ratings).map(([category, rating]) => ({
          category: category as RatingCategory,
          rating: rating as number,
        })),
      }),
    {
      onSuccess: () => { queryClient.invalidateQueries(['appraisal', id]); },
      onError: () => { setAnswersAutoSave('idle'); },
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
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to advance workflow')); },
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
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to add comment')); },
    }
  );

  const questionCommentMutation = useMutation(
    ({ qId, text }: { qId: string; text: string }) =>
      appraisalService.addComment(id!, text, qId),
    {
      onSuccess: (_data, { qId }) => {
        setQuestionCommentDrafts((prev) => ({ ...prev, [qId]: '' }));
        setSubmittingQuestionId(null);
        queryClient.invalidateQueries(['appraisal-comments', id]);
      },
      onError: (err) => {
        setSubmittingQuestionId(null);
        toast.error(getErrorMessage(err, 'Failed to add comment'));
      },
    }
  );

  const reviewerRatingsMutation = useMutation(
    () =>
      appraisalService.saveReviewerRatings(
        id!,
        Object.entries(reviewerRatings).map(([category, rating]) => ({
          category: category as import('@/types/index').RatingCategory,
          rating,
        }))
      ),
    {
      onSuccess: () => {
        toast.success('Review ratings saved');
        queryClient.invalidateQueries(['appraisal', id]);
      },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to save review ratings')); },
    }
  );

  const saveManagerFeedbackMutation = useMutation(
    () => appraisalService.saveManagerFeedback(id!, managerFeedback, managerConsolidatedRating || null),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appraisal', id]);
      },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to save feedback')); },
    }
  );

  const returnMutation = useMutation(
    () => appraisalService.returnAppraisal(id!, returnReason),
    {
      onSuccess: () => {
        toast.success('Appraisal returned to developer for revision');
        setShowReturnModal(false);
        setReturnReason('');
        queryClient.invalidateQueries(['appraisal', id]);
        queryClient.invalidateQueries(['appraisals']);
      },
      onError: (err) => { toast.error(getErrorMessage(err, 'Failed to return appraisal')); },
    }
  );

  // Auto-save questionnaire answers 2s after last change (Fix 4)
  useEffect(() => {
    if (!canEditRef.current || !isInitializedRef.current) return;
    setAnswersAutoSave('saving');
    const timer = setTimeout(() => {
      autoSaveMutation.mutate();
      setAnswersAutoSave('saved');
      setTimeout(() => setAnswersAutoSave('idle'), 3000);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, ratings]);

  // Auto-save reviewer ratings 2s after last change
  useEffect(() => {
    if (!canReviewRatingsRef.current) return;
    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      reviewerRatingsMutation.mutate();
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewerRatings]);

  // Auto-save manager feedback 2s after last change
  useEffect(() => {
    if (!canEditFeedbackRef.current) return;
    setFeedbackAutoSave('saving');
    const timer = setTimeout(() => {
      saveManagerFeedbackMutation.mutate();
      setFeedbackAutoSave('saved');
      setTimeout(() => setFeedbackAutoSave('idle'), 3000);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerFeedback, managerConsolidatedRating]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveMutation.mutateAsync().finally(() => setIsSaving(false));
  };

  const handleAnswerChange = (questionId: string, html: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: html }));
  };

  const handleRatingChange = (category: string, rating: number) => {
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
  const isOwnAppraisal = String(appraisal.userId) === String(user?.id);
  const isDeveloperOrTester = user?.role === 'developer' || user?.role === 'tester';
  const canEdit = isOwnAppraisal && isDraft;
  const canAdvance =
    !isCompleted &&
    ((isOwnAppraisal && isDraft) ||
      (user?.role === 'tech_lead' && appraisal.status === 'tech_lead_review') ||
      (user?.role === 'manager' && appraisal.status === 'manager_review') ||
      user?.role === 'admin');

  const canReviewRatings =
    !isOwnAppraisal &&
    !isCompleted &&
    ((user?.role === 'tech_lead' && appraisal.status === 'tech_lead_review') ||
      (user?.role === 'manager' && appraisal.status === 'manager_review'));

  const canReturn =
    !isOwnAppraisal &&
    !isCompleted &&
    !isDraft &&
    ((user?.role === 'tech_lead' && appraisal.status === 'tech_lead_review') ||
      (user?.role === 'manager' && appraisal.status === 'manager_review') ||
      user?.role === 'admin');

  const reviewerLabel = user?.role === 'manager' || user?.role === 'admin' ? 'Manager' : 'Tech Lead';
  const canEditManagerFeedback =
    appraisal.status === 'manager_review' &&
    user?.role === 'manager';
  const consolidatedRatingMissing =
    appraisal.status === 'manager_review' && user?.role === 'manager' && !managerConsolidatedRating;
  canReviewRatingsRef.current = canReviewRatings;
  canEditFeedbackRef.current = canEditManagerFeedback;
  canEditRef.current = canEdit;
  const deadlineBadge = appraisal.deadline ? getDeadlineBadge(appraisal.deadline, isCompleted) : null;

  // Show TL's ratings as a readonly row when the manager is reviewing or the appraisal is completed
  // Show TL ratings as a readonly reference row only for managers/admins/developers — never for
  // tech leads themselves, since their own ratings are already shown via reviewerRatings.
  const showTechLeadRow =
    Object.keys(techLeadRatings).length > 0 &&
    user?.role !== 'tech_lead' &&
    !(isOwnAppraisal && isDeveloperOrTester) &&
    (!isOwnAppraisal
      ? (user?.role === 'manager' && canReviewRatings) || isCompleted
      : isCompleted);

  const handleReviewerRatingChange = (category: string, rating: number) => {
    setReviewerRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const handleSaveReview = async () => {
    setIsSavingReview(true);
    await reviewerRatingsMutation.mutateAsync().finally(() => setIsSavingReview(false));
  };

  // Tech leads and managers skip the TL review stage for their own appraisal
  const skipsTechLeadReview = appraiseeRole === 'tech_lead' || appraiseeRole === 'manager';
  const advanceLabel = ADVANCE_LABELS[appraisal.status] ?? 'Advance';

  const questionCommentMap: Record<string, Comment[]> = {};
  commentsQuery.data?.forEach((c) => {
    if (c.questionId) {
      const key = String(c.questionId);
      questionCommentMap[key] = [...(questionCommentMap[key] ?? []), c];
    }
  });

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
              <span className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Due {format(new Date(appraisal.deadline), 'MMM d, yyyy')}
                </span>
                {deadlineBadge === 'overdue' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Overdue</span>
                )}
                {deadlineBadge === 'due-soon' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Due soon</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: questionnaire / readonly view */}
        <div className="lg:col-span-3 space-y-6">

          {/* AI Summary card — reviewers only, non-draft appraisals */}
          {!isOwnAppraisal && !isDraft && (
            <div className="card card-body space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-slate-800">AI Summary</span>
                  <span className="text-xs text-slate-400">Self-assessment highlights</span>
                </div>
                {aiSummary ? (
                  <button
                    onClick={async () => {
                      setSummaryLoading(true);
                      try {
                        const s = await appraisalService.generateSummary(id!, true);
                        setAiSummary(s);
                      } catch {
                        toast.error('Failed to regenerate summary');
                      } finally {
                        setSummaryLoading(false);
                      }
                    }}
                    disabled={summaryLoading}
                    className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1"
                  >
                    {summaryLoading ? <LoadingSpinner size="sm" /> : <SparklesIcon className="w-3 h-3" />}
                    Regenerate
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setSummaryLoading(true);
                      try {
                        const s = await appraisalService.generateSummary(id!);
                        setAiSummary(s);
                      } catch {
                        toast.error('Failed to generate summary');
                      } finally {
                        setSummaryLoading(false);
                      }
                    }}
                    disabled={summaryLoading}
                    className="btn-primary btn-sm flex items-center gap-1.5"
                  >
                    {summaryLoading ? <LoadingSpinner size="sm" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                    {summaryLoading ? 'Analysing…' : 'Generate Summary'}
                  </button>
                )}
              </div>
              {aiSummary && (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
              )}
              {!aiSummary && !summaryLoading && (
                <p className="text-xs text-slate-400 italic">
                  Click "Generate Summary" to get a concise AI-generated overview of the self-assessment.
                </p>
              )}
            </div>
          )}

          {/* Section tabs */}
          {sections.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {sections.map((sec, idx) => {
                const isIncomplete = canEdit && incompleteSections.has(sec.section);
                const isComplete = canEdit && !incompleteSections.has(sec.section);
                return (
                  <button
                    key={sec.section}
                    onClick={() => setActiveSection(idx)}
                    className={clsx(
                      'relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      activeSection === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {sec.sectionTitle}
                    {isIncomplete && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                    {isComplete && (
                      <CheckCircleIcon className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-green-500 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
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
                  <div key={q.id} data-question-id={q.id}>
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
                    <QuestionCommentThread
                      questionId={String(q.id)}
                      comments={questionCommentMap[String(q.id)] ?? []}
                      isOpen={!!openQuestionComments[q.id]}
                      draft={questionCommentDrafts[q.id] ?? ''}
                      isSubmitting={submittingQuestionId === String(q.id)}
                      onToggle={() =>
                        setOpenQuestionComments((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      onDraftChange={(v) =>
                        setQuestionCommentDrafts((prev) => ({ ...prev, [q.id]: v }))
                      }
                      onSubmit={() => {
                        const text = (questionCommentDrafts[String(q.id)] ?? '').trim();
                        if (text.length < 10) {
                          toast.error('Comment must be at least 10 characters');
                          return;
                        }
                        setSubmittingQuestionId(String(q.id));
                        questionCommentMutation.mutate({ qId: String(q.id), text });
                      }}
                    />
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

          {/* Ratings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Ratings</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {canEdit
                      ? 'Rate yourself honestly on each dimension (1–5)'
                      : canReviewRatings
                      ? `Your ratings as ${reviewerLabel} alongside self-ratings`
                      : isDeveloperOrTester
                      ? 'Your self-assessment'
                      : 'Ratings across all reviewers'}
                  </p>
                </div>
                {(canReviewRatings || (isCompleted && !isDeveloperOrTester)) && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Self
                    </span>
                    {(showTechLeadRow || (canReviewRatings && user?.role === 'manager')) && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                        Tech Lead
                      </span>
                    )}
                    {(canReviewRatings || (isCompleted && Object.keys(reviewerRatings).length > 0)) && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        {reviewerLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="card-body divide-y divide-slate-100">
              {getRatingConfig(appraisal.user?.role).map((cat) => (
                <div key={cat.key} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{cat.label}</p>
                      <p className="text-xs text-slate-500">{cat.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Self rating */}
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-2">
                          {(canReviewRatings || (isCompleted && !isDeveloperOrTester)) && (
                            <span className="text-xs text-slate-400 w-16 text-right">Self</span>
                          )}
                          <StarRating
                            value={ratings[cat.key] ?? 0}
                            onChange={canEdit ? (v) => handleRatingChange(cat.key, v) : undefined}
                            readonly={!canEdit}
                            size="md"
                            color="amber"
                          />
                        </div>
                        {(ratings[cat.key] ?? 0) > 0 && (
                          <span className="text-xs text-slate-400 italic">{RATING_LABELS[ratings[cat.key]]}</span>
                        )}
                      </div>
                      {/* Tech Lead rating — shown to managers (readonly) and on completed view */}
                      {showTechLeadRow && (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-16 text-right">Tech Lead</span>
                            <StarRating
                              value={techLeadRatings[cat.key] ?? 0}
                              readonly
                              size="md"
                              color="sky"
                            />
                          </div>
                          {(techLeadRatings[cat.key] ?? 0) > 0 && (
                            <span className="text-xs text-slate-400 italic">{RATING_LABELS[techLeadRatings[cat.key]]}</span>
                          )}
                        </div>
                      )}
                      {/* Reviewer's own rating (editable while active, readonly when completed) */}
                      {(canReviewRatings || (isCompleted && !isDeveloperOrTester && reviewerRatings[cat.key])) && (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-16 text-right">{reviewerLabel}</span>
                            <StarRating
                              value={reviewerRatings[cat.key] ?? 0}
                              onChange={canReviewRatings ? (v) => handleReviewerRatingChange(cat.key, v) : undefined}
                              readonly={!canReviewRatings}
                              size="md"
                              color="indigo"
                            />
                          </div>
                          {(reviewerRatings[cat.key] ?? 0) > 0 && (
                            <span className="text-xs text-slate-400 italic">{RATING_LABELS[reviewerRatings[cat.key]]}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manager feedback — editable during manager_review, readonly when completed */}
          {(canEditManagerFeedback || (isCompleted && !isDeveloperOrTester && (appraisal.managerFeedback || appraisal.consolidatedRating))) && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Manager's Final Feedback</h2>
                    {canEditManagerFeedback && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Add your overall assessment for this appraisal
                      </p>
                    )}
                  </div>
                  {canEditManagerFeedback && (
                    <span className="text-xs text-slate-400">
                      {feedbackAutoSave === 'saving' && 'Saving…'}
                      {feedbackAutoSave === 'saved' && (
                        <span className="text-green-600">Saved</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body space-y-4">
                {/* Consolidated Rating */}
                {canEditManagerFeedback ? (
                  <div className="pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Overall Performance Rating</p>
                        <p className="text-xs text-slate-500 mt-0.5">Your consolidated verdict for this employee</p>
                      </div>
                      {managerConsolidatedRating > 0 && (
                        <span className="text-xs text-slate-500 italic">{RATING_LABELS[managerConsolidatedRating]}</span>
                      )}
                    </div>
                    <StarRating value={managerConsolidatedRating} onChange={setManagerConsolidatedRating} size="lg" color="indigo" />
                    {!managerConsolidatedRating && (
                      <p className="text-xs text-rose-500 mt-1">Required before marking as completed</p>
                    )}
                  </div>
                ) : (
                  appraisal.consolidatedRating && (
                    <div className="pb-4 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Overall Performance</p>
                      <div className="flex items-center gap-3">
                        <StarRating value={appraisal.consolidatedRating} readonly size="lg" color="indigo" />
                        <span className="text-sm font-semibold text-indigo-700">{RATING_LABELS[appraisal.consolidatedRating]}</span>
                      </div>
                    </div>
                  )
                )}
                {/* Feedback text */}
                {canEditManagerFeedback ? (
                  <textarea
                    value={managerFeedback}
                    onChange={(e) => setManagerFeedback(e.target.value)}
                    placeholder="Write your final feedback for this employee..."
                    rows={5}
                    className="input resize-none text-sm"
                  />
                ) : (
                  appraisal.managerFeedback && (
                    <div className="prose-content text-sm text-slate-700 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
                      {appraisal.managerFeedback}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 items-center">
            {canEdit && (
              <button onClick={handleSave} disabled={isSaving} className="btn-secondary">
                {isSaving ? <LoadingSpinner size="sm" /> : 'Save Draft'}
              </button>
            )}
            {canEdit && answersAutoSave === 'saving' && (
              <span className="text-xs text-slate-400">Auto-saving…</span>
            )}
            {canEdit && answersAutoSave === 'saved' && (
              <span className="text-xs text-green-600">Auto-saved</span>
            )}
            {canReviewRatings && (
              <div className="flex items-center gap-3">
                <button onClick={handleSaveReview} disabled={isSavingReview} className="btn-secondary">
                  {isSavingReview ? <LoadingSpinner size="sm" /> : 'Save Review Ratings'}
                </button>
                {autoSaveStatus === 'saving' && (
                  <span className="text-xs text-slate-400">Saving…</span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="text-xs text-green-600">Saved</span>
                )}
              </div>
            )}
          </div>
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
                {(skipsTechLeadReview
                    ? (['draft', 'manager_review', 'completed'] as const)
                    : (['draft', 'tech_lead_review', 'manager_review', 'completed'] as const))
                  .map((stage) => {
                    const orderedStages = skipsTechLeadReview
                      ? ['draft', 'manager_review', 'completed']
                      : ['draft', 'tech_lead_review', 'manager_review', 'completed'];
                    const isPast = orderedStages.indexOf(stage) < orderedStages.indexOf(appraisal.status);
                    const isCurrent = appraisal.status === stage;
                    const label = stage === 'draft' && isPast ? 'Submitted' : stage.replace(/_/g, ' ');
                    return (
                      <div key={stage} className="flex items-center gap-2">
                        {isPast ? (
                          <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 -ml-px" />
                        ) : (
                          <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                            <div
                              className={clsx(
                                'w-2.5 h-2.5 rounded-full',
                                isCurrent ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-300'
                              )}
                            />
                          </div>
                        )}
                        <span
                          className={clsx(
                            'text-xs capitalize',
                            isCurrent ? 'text-indigo-700 font-semibold' : isPast ? 'text-green-700' : 'text-slate-400'
                          )}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {canAdvance && (
                <>
                  <button
                    onClick={() => {
                      if (canEdit && incompleteSections.size > 0) {
                        const firstIncompleteSection = sections.find((s) => incompleteSections.has(s.section));
                        const firstIncompleteIdx = sections.indexOf(firstIncompleteSection!);
                        setActiveSection(firstIncompleteIdx);
                        toast.error('Please answer all questions before submitting');
                        // After section renders, scroll to and focus the first unanswered question
                        setTimeout(() => {
                          const firstEmptyQ = firstIncompleteSection?.questions.find((q) => !hasText(answers[q.id]));
                          if (firstEmptyQ) {
                            const el = document.querySelector(`[data-question-id="${firstEmptyQ.id}"]`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              const contentEditable = el.querySelector('[contenteditable]') as HTMLElement | null;
                              contentEditable?.focus();
                            }
                          }
                        }, 50);
                        return;
                      }
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
                    disabled={submitMutation.isLoading || saveMutation.isLoading || consolidatedRatingMissing}
                    className="btn-primary w-full mt-2"
                    title={consolidatedRatingMissing ? 'Provide a consolidated rating first' : undefined}
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
                  {consolidatedRatingMissing && (
                    <p className="text-xs text-rose-500 text-center mt-1">Set a consolidated rating to complete</p>
                  )}
                </>
              )}
              {canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="btn-secondary w-full mt-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" />
                  Return for Revision
                </button>
              )}
            </div>
          </div>

          {/* Appraisee info */}
          {appraisal.user && !isOwnAppraisal && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-slate-900">Appraisee</h3>
              </div>
              <div className="card-body space-y-1">
                <p className="text-sm font-medium text-slate-900">{appraisal.user.name}</p>
                <p className="text-xs text-slate-500">{appraisal.user.email}</p>
                <p className="text-xs text-slate-400 capitalize">{appraisal.user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          {/* Comments panel — appraisal-level only (question comments are inline) */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
            </div>
            <div className="card-body space-y-4">
              {(() => {
                const appraisalLevelComments = commentsQuery.data?.filter((c) => !c.questionId) ?? [];
                return commentsQuery.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : appraisalLevelComments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {appraisalLevelComments.map((c) => (
                      <CommentItem key={c.id} comment={c} />
                    ))}
                  </div>
                );
              })()}

              {(!isCompleted && (isOwnAppraisal ? appraisal.status !== 'draft' : true)) && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isOwnAppraisal ? 'Reply to reviewer comments...' : 'Add a comment...'}
                    rows={3}
                    className="input resize-none text-sm"
                  />
                  <button
                    onClick={() => commentMutation.mutate()}
                    disabled={!newComment.trim() || commentMutation.isLoading}
                    className="btn-primary btn-sm w-full"
                  >
                    {commentMutation.isLoading ? <LoadingSpinner size="sm" /> : isOwnAppraisal ? 'Send Reply' : 'Add Comment'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Return for Revision Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Return for Revision</h3>
            <p className="text-sm text-slate-500">
              The appraisal will be returned to <strong>{appraisal.user?.name}</strong> as a draft for revision.
              Add an optional reason (at least 10 characters to include it as a comment).
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for returning (optional, min 10 chars to save as comment)..."
              rows={4}
              className="input resize-none text-sm w-full"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReturnModal(false); setReturnReason(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => returnMutation.mutate()}
                disabled={returnMutation.isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {returnMutation.isLoading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    Confirm Return
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
