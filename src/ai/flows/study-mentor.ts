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
  advice: z.string().describe('The AI mentor\s advice and suggestions.'),
});
export type StudyAdviceOutput = z.infer<typeof StudyAdviceOutputSchema>;

export async function getStudyAdvice(input: StudyAdviceInput): Promise<StudyAdviceOutput> {
  return studyAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyAdvicePrompt',
  input: {schema: StudyAdviceInputSchema},
  output: {schema: StudyAdviceOutputSchema},
  prompt: `You are an AI study mentor providing helpful and personalized advice to students.

  A student has asked the following question:
  {{query}}

  Provide clear, concise, and actionable advice to help the student with their studies. Focus on study methods, summaries, and motivation.  Assume the student is in college and studying a technical topic like computer science.`,
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
