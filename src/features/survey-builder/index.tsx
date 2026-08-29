import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { LivePreview } from "./components/LivePreview";
import { QuestionList } from "./components/QuestionList";
import { SurveyBuilderSkeleton } from "./components/SurveyBuilderSkeleton";
import { SurveyDetails } from "./components/SurveyDetails";
import { SurveyHeader } from "./components/SurveyHeader";
import { usePreviewAnswers } from "./hooks/usePreviewAnswers";
import { useSurveyForm } from "./hooks/useSurveyForm";

import { getQuestionAnswerOptions } from "./utils";

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    form,
    loading,
    fetchingSurvey,
    updateForm,
    handleTitleChange,
    updateQuestion,
    addQuestion,
    removeQuestion,
    moveQuestion,
    changeQuestionType,
    handleSave,
  } = useSurveyForm(id);

  const { previewAnswers, updatePreviewAnswer, resetPreview } =
    usePreviewAnswers(form.schema.questions);

  const getAvailableConditionQuestions = (questionIndex: number) => {
    return form.schema.questions.slice(0, questionIndex).filter((question) => {
      return (
        question.type === "SINGLE_SELECT" ||
        question.type === "MULTI_SELECT" ||
        question.type === "RATING"
      );
    });
  };

  const handleCopyLink = async () => {
    if (!form.slug) {
      toast.error("Survey link is not available");
      return;
    }

    const surveyUrl = `${window.location.origin}/survey/${form.slug}`;
    try {
      await navigator.clipboard.writeText(surveyUrl);
      toast.success("Survey link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy survey link:", error);
      toast.error("Failed to copy survey link");
    }
  };

  if (fetchingSurvey) {
    return <SurveyBuilderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SurveyHeader
        id={id}
        slug={form.slug}
        loading={loading}
        onCopyLink={handleCopyLink}
        onCancel={() => navigate("/surveys")}
        onSave={handleSave}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Builder */}
          <div className="space-y-6">
            <SurveyDetails
              title={form.title}
              description={form.description}
              slug={form.slug}
              onTitleChange={handleTitleChange}
              onDescriptionChange={(value) =>
                updateForm({ description: value })
              }
              onSlugChange={(value) => updateForm({ slug: value })}
            />

            <QuestionList
              questions={form.schema.questions}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onRemoveQuestion={removeQuestion}
              onMoveQuestion={moveQuestion}
              onChangeQuestionType={changeQuestionType}
              onAddOption={(id) => {
                const q = form.schema.questions.find((q) => q.id === id);
                if (!q) return;
                const options = q.options ?? [];
                updateQuestion(id, {
                  options: [
                    ...options,
                    {
                      label: `Option ${options.length + 1}`,
                      value: `option-${options.length + 1}`,
                    },
                  ],
                });
              }}
              onUpdateOption={(id, index, label) => {
                const q = form.schema.questions.find((q) => q.id === id);
                if (!q?.options) return;
                const options = [...q.options];
                options[index] = {
                  label,
                  value: label
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                };
                updateQuestion(id, { options });
              }}
              onRemoveOption={(id, index) => {
                const q = form.schema.questions.find((q) => q.id === id);
                if (!q?.options) return;
                updateQuestion(id, {
                  options: q.options.filter((_, i) => i !== index),
                });
              }}
              onSetCondition={(id, sourceId) => {
                if (!sourceId) {
                  updateQuestion(id, { condition: undefined });
                  return;
                }
                const source = form.schema.questions.find(
                  (q) => q.id === sourceId,
                );
                if (!source) return;
                const options = getQuestionAnswerOptions(source);
                if (options.length === 0) {
                  updateQuestion(id, { condition: undefined });
                  return;
                }
                updateQuestion(id, {
                  condition: {
                    questionId: sourceId,
                    operator: "equals",
                    value: options[0].value,
                  },
                });
              }}
              onUpdateConditionValue={(id, value) => {
                if (!value) return;
                const q = form.schema.questions.find((q) => q.id === id);
                if (!q?.condition) return;
                updateQuestion(id, {
                  condition: { ...q.condition, value },
                });
              }}
              onUpdateConditionOperator={(id, operator) => {
                if (
                  !operator ||
                  (operator !== "equals" &&
                    operator !== "not_equals" &&
                    operator !== "contains")
                )
                  return;
                const q = form.schema.questions.find((q) => q.id === id);
                if (!q?.condition) return;
                updateQuestion(id, {
                  condition: {
                    ...q.condition,
                    operator: operator as any,
                  },
                });
              }}
              getAvailableConditionQuestions={getAvailableConditionQuestions}
              getQuestionAnswerOptions={getQuestionAnswerOptions}
            />
          </div>

          {/* Preview */}
          <LivePreview
            title={form.title}
            description={form.description}
            questions={form.schema.questions}
            previewAnswers={previewAnswers}
            onUpdatePreviewAnswer={updatePreviewAnswer}
            onResetPreview={resetPreview}
          />
        </div>
      </main>
    </div>
  );
};

export default SurveyBuilder;
