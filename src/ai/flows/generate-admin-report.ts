'use server';

/**
 * @fileOverview This file defines the generateAdminReport flow, which generates monthly reports summarizing platform usage and student performance for admins.
 *
 * @exports generateAdminReport - An asynchronous function that triggers the report generation flow.
 * @exports AdminReportOutput - The output type for the generateAdminReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminReportOutputSchema = z.object({
  report: z.string().describe('A summary of top performing students, most shared topics, and overall platform usage insights.'),
});
export type AdminReportOutput = z.infer<typeof AdminReportOutputSchema>;

export async function generateAdminReport(): Promise<AdminReportOutput> {
  return generateAdminReportFlow({});
}

const prompt = ai.definePrompt({
  name: 'adminReportPrompt',
  output: {schema: AdminReportOutputSchema},
  prompt: `You are an AI assistant tasked with generating a concise monthly report for StudySync administrators.

The report should include:
- A summary of the top performing students, highlighting their achievements and contributions.
- Identification of the most shared topics and resources on the platform.
- Overall platform usage insights, including active users, popular features, and areas for improvement.

Generate a report that is informative and actionable, providing key insights for administrators to optimize the StudySync platform.
`,
});

const generateAdminReportFlow = ai.defineFlow(
  {
    name: 'generateAdminReportFlow',
    inputSchema: z.object({}),
    outputSchema: AdminReportOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
