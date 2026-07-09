import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommunityAnswer,
  CommunityQuestion,
  CommunityReaction,
  QnaQuestionStatus
} from "@/lib/supabase/types";

export async function getQnaAnswerCounts(
  client: SupabaseClient,
  postIds: string[]
) {
  const counts = new Map<string, number>();
  postIds.forEach((id) => counts.set(id, 0));

  if (postIds.length === 0) {
    return counts;
  }

  const { data } = await client
    .from("community_answers")
    .select("post_id")
    .eq("status", "published")
    .in("post_id", postIds);

  ((data ?? []) as Pick<CommunityAnswer, "post_id">[]).forEach((answer) => {
    counts.set(answer.post_id, (counts.get(answer.post_id) ?? 0) + 1);
  });

  return counts;
}

export async function getQnaLikeCounts(client: SupabaseClient, postIds: string[]) {
  const counts = new Map<string, number>();
  postIds.forEach((id) => counts.set(id, 0));

  if (postIds.length === 0) {
    return counts;
  }

  const { data } = await client
    .from("community_reactions")
    .select("target_id")
    .eq("target_type", "post")
    .eq("reaction_type", "like")
    .in("target_id", postIds);

  ((data ?? []) as Pick<CommunityReaction, "target_id">[]).forEach((reaction) => {
    counts.set(reaction.target_id, (counts.get(reaction.target_id) ?? 0) + 1);
  });

  return counts;
}

export async function getAnswerHelpfulCounts(
  client: SupabaseClient,
  answerIds: string[]
) {
  const counts = new Map<string, number>();
  answerIds.forEach((id) => counts.set(id, 0));

  if (answerIds.length === 0) {
    return counts;
  }

  const { data } = await client
    .from("community_reactions")
    .select("target_id")
    .eq("target_type", "answer")
    .eq("reaction_type", "helpful")
    .in("target_id", answerIds);

  ((data ?? []) as Pick<CommunityReaction, "target_id">[]).forEach((reaction) => {
    counts.set(reaction.target_id, (counts.get(reaction.target_id) ?? 0) + 1);
  });

  return counts;
}

export async function getQnaHelpfulCountsByPost(
  client: SupabaseClient,
  answers: Pick<CommunityAnswer, "id" | "post_id">[]
) {
  const counts = new Map<string, number>();
  const answerToPost = new Map(answers.map((answer) => [answer.id, answer.post_id]));

  answers.forEach((answer) => counts.set(answer.post_id, 0));

  if (answers.length === 0) {
    return counts;
  }

  const helpfulCounts = await getAnswerHelpfulCounts(
    client,
    answers.map((answer) => answer.id)
  );

  helpfulCounts.forEach((count, answerId) => {
    const postId = answerToPost.get(answerId);

    if (postId) {
      counts.set(postId, (counts.get(postId) ?? 0) + count);
    }
  });

  return counts;
}

export async function getMyHelpfulAnswerIds(
  client: SupabaseClient,
  answerIds: string[],
  userId: string | null
) {
  if (!userId || answerIds.length === 0) {
    return new Set<string>();
  }

  const { data } = await client
    .from("community_reactions")
    .select("target_id")
    .eq("target_type", "answer")
    .eq("reaction_type", "helpful")
    .eq("user_id", userId)
    .in("target_id", answerIds);

  return new Set(
    ((data ?? []) as Pick<CommunityReaction, "target_id">[]).map(
      (reaction) => reaction.target_id
    )
  );
}

export async function recalculateQuestionStatus(
  client: SupabaseClient,
  postId: string
) {
  const { data: question } = await client
    .from("community_questions")
    .select("*")
    .eq("post_id", postId)
    .maybeSingle<CommunityQuestion>();

  if (!question) {
    return;
  }

  if (question.accepted_answer_id) {
    await client
      .from("community_questions")
      .update({ question_status: "accepted" satisfies QnaQuestionStatus })
      .eq("post_id", postId);
    return;
  }

  const { data: answers } = await client
    .from("community_answers")
    .select("id")
    .eq("post_id", postId)
    .eq("status", "published");
  const nextStatus: QnaQuestionStatus =
    (answers ?? []).length > 0 ? "answered" : "waiting";

  await client
    .from("community_questions")
    .update({ question_status: nextStatus })
    .eq("post_id", postId);
}
