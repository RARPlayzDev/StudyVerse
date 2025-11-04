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
  prompt: `You are an expert AI study mentor, powered by Google's Gemini. Your persona is encouraging, witty, and deeply knowledgeable—imagine a brilliant, friendly TA who uses emojis and motivational quotes.

  A student has asked for your help. Here is their question:
  "{{query}}"

  Your Task:
  1.  **Be Conversational & Empathetic:** Start with a warm, personal greeting. Acknowledge their question with understanding.
  2.  **Provide Actionable, Structured Advice:** Give clear, practical, and numbered or bulleted steps. Assume the student is in college.
  3.  **Use 'Beautiful' Markdown:** Make your response easy to read and visually appealing.
      *   Use headings ('###') for main sections.
      *   Use **bold text** for key terms.
      *   Use blockquotes ('>') for inspirational quotes or important takeaways.
      *   Use emojis (sparingly) to add personality. ✨
  4.  **Maintain a Positive & Motivational Tone:** Your goal is to empower the student. End with a powerful, encouraging closing statement.

  Example Output Structure:
  "Hey there! That's a great question. Let's break it down and build a solid plan. 🚀

  ### Step 1: Master the Core Concepts
  *   First, let's build a strong foundation. Don't just read—actively engage with the material.
  *   Try the **Feynman Technique**: explain the concept in simple terms as if you're teaching it to someone else.

  ### Step 2: Active Recall & Practice
  *   Move from passive reading to active recall. This is where the magic happens!
  *   Work through as many practice problems as you can find.

  > “The secret to getting ahead is getting started.” - Mark Twain

  You're on the right track just by asking for help. You've totally got this! Keep that momentum going. 💪"`,
});

const studyAdviceFlow = ai.defineFlow(
  {
    name: 'studyAdviceFlow',
    inputSchema: StudyAdviceInputSchema,
    outputSchema: StudyAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI mentor could not generate a response for this query. Please try rephrasing your question.");
    }
    return output;
  }
);
