import type { Storyboard } from "./storyboard";

/**
 * Output helpers for S-4/S-5 (Stages 9–11). Wording: docs/13 §12.
 */

/** F9.5: `{title-slug}-{language}.{ext}`, e.g. "how-plants-make-food-fr-FR.mp4". */
export function videoFileName(title: string, languageCode: string, ext: "mp4" | "webm"): string {
  const slug =
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // é → e
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60)
      .replace(/-+$/, "") || "lesson";
  return `${slug}-${languageCode}.${ext}`;
}

const LETTERS = ["a", "b", "c"] as const;

/** Letter for an option index: 0 → "a". */
export function optionLetter(i: number): string {
  return LETTERS[i] ?? String(i + 1);
}

/** F2.5 copied quiz: "{title}: quiz\n1. {question}\n a) … b) … c) …\n Answer: {letter}". */
export function quizText(board: Pick<Storyboard, "title" | "quiz">): string {
  const items = board.quiz.map(
    (q, n) =>
      `${n + 1}. ${q.question}\n ${q.options.map((o, i) => `${optionLetter(i)}) ${o}`).join(" ")}\n Answer: ${optionLetter(q.answerIndex)}`,
  );
  return [`${board.title}: quiz`, ...items].join("\n");
}

/** Languages a lesson's video can be made in, English first (S-4/S-5 "Video language"). */
export function videoLanguages(languages: string[]): string[] {
  const unique = Array.from(new Set(languages));
  return [
    ...unique.filter((l) => l.startsWith("en")),
    ...unique.filter((l) => !l.startsWith("en")),
  ];
}
