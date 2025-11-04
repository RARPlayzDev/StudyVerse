// Version 1.0 Final Push
// src/ai/flows/study-mentor.ts
'use server';
/**
 * @fileOverview A flow for providing study advice and motivation to students.
 *
 * - getStudyAdvice - A function that takes a user's query and returns study advice from the AI mentor.
 * - StudyAdviceInput - The input type for the getStudyAdvice function.
 * - StudyAdviceOutput - The return type for the getStudyAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyAdviceInputSchema = z.object({
  query: z.string().describe('The user\s query or question about study methods, summaries, or motivation.'),
});
export type StudyAdviceInput = z.infer<typeof StudyAdviceInputSchema>;

const StudyAdviceOutputSchema = z.object({
  advice: z.string().describe('The AI mentor\s advice and suggestions, formatted in Markdown.'),
});
export type StudyAdviceOutput = z.infer<typeof StudyAdviceOutputSchema>;

export async function getStudyAdvice(input: StudyAdviceInput): Promise<StudyAdviceOutput> {
  return studyAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyAdvicePrompt',
  input: {schema: StudyAdviceInputSchema},
  output: {schema: StudyAdviceOutputSchema},
  prompt: `You are an expert AI study mentor, powered by Google's Gemini. Your persona is encouraging, empathetic, and highly knowledgeable, like a friendly and brilliant teaching assistant.

  A student has asked the following question:
  "{{query}}"

  Your Task:
  1.  **Be Conversational:** Address the student directly and personally.
  2.  **Provide Actionable Advice:** Give clear, concise, and practical steps. Assume the student is in college, likely studying a technical topic like computer science.
  3.  **Format for Readability:** Structure your response using Markdown. Use headings, bullet points, and bold text to make the information easy to digest.
  4.  **Maintain a Positive Tone:** Be motivational and supportive. End with an encouraging closing statement.

  Example Output Structure:
  "Of course! Here’s a plan to tackle that...

  ### Step 1: Foundational Understanding
  *   First, focus on the core concepts...
  *   Try to explain it to a friend...

  ### Step 2: Active Practice
  *   Work through practice problems...
  *   **Don't** just read the solutions...

  You've got this! Keep up the great work."`,
});

const studyAdviceFlow = ai.defineFlow(
  {
    name: 'studyAdviceFlow',
    inputSchema: StudyAdviceInputSchema,
    outputSchema: StudyAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
