import type { User, Task, Note, CollabRoom, FocusSession, Message } from './types';
import { Timestamp } from 'firebase/firestore';


export const placeholderUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: 'https://picsum.photos/seed/user1/100/100', role: 'student', joinDate: '2023-09-01', lastActive: '2 hours ago', banned: false },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', avatarUrl: 'https://picsum.photos/seed/user2/100/100', role: 'student', joinDate: '2023-10-15', lastActive: '5 hours ago', banned: false },
  { id: '3', name: 'Admin User', email: 'admin@studyverse.com', avatarUrl: 'https://picsum.photos/seed/admin/100/100', role: 'admin', joinDate: '2023-01-01', lastActive: '10 minutes ago', banned: false },
  { id: '4', name: 'Ken Adams', email: 'ken@example.com', avatarUrl: 'https://picsum.photos/seed/user4/100/100', role: 'student', joinDate: '2023-11-20', lastActive: '1 day ago', banned: true },
];

export const placeholderTasks: Task[] = [
  { id: 't1', userId: '1', title: 'Complete Chapter 5 Reading', subject: 'History', startDate: '2024-08-10', dueDate: '2024-08-15', priority: 'high', status: 'inprogress' },
  { id: 't2', userId: '1', title: 'Solve Problem Set 3', subject: 'Calculus', startDate: '2024-08-10', dueDate: '2024-08-12', priority: 'high', status: 'todo' },
  { id: 't3', userId: '1', title: 'Prepare for Midterm', subject: 'Physics', startDate: '2024-08-15', dueDate: '2024-08-20', priority: 'medium', status: 'todo' },
  { id: 't4', userId: '1', title: 'Finish Lab Report', subject: 'Chemistry', startDate: '2024-08-08', dueDate: '2024-08-10', priority: 'low', status: 'done' },
  { id: 't5', userId: '1', title: 'Build React Component', subject: 'CS', startDate: '2024-08-12', dueDate: '2024-08-18', priority: 'high', status: 'inprogress' },
  { id: 't6', userId: '1', title: 'Write Essay Outline', subject: 'Literature', startDate: '2024-08-11', dueDate: '2024-08-14', priority: 'medium', status: 'done' },
];

export const placeholderNotes: Note[] = [
    { id: 'n1', userId: '2', title: 'Calculus Cheat Sheet', subject: 'Calculus', uploader: 'Maria Garcia', date: Timestamp.fromDate(new Date('2024-08-01')), downloads: 152, fileUrl: '#', fileType: 'pdf' },
    { id: 'n2', userId: '1', title: 'WWII Key Events', subject: 'History', uploader: 'Alex Johnson', date: Timestamp.fromDate(new Date('2024-07-28')), downloads: 89, fileUrl: '#', fileType: 'md' },
    { id: 'n3', userId: '3', title: 'Quantum Mechanics Intro', subject: 'Physics', uploader: 'Admin User', date: Timestamp.fromDate(new Date('2024-08-05')), downloads: 210, fileUrl: '#', fileType: 'pdf' },
    { id: 'n4', userId: '2', title: 'Organic Chemistry Reactions', subject: 'Chemistry', uploader: 'Maria Garcia', date: Timestamp.fromDate(new Date('2024-07-30')), downloads: 120, fileUrl: '#', fileType: 'pdf' },
];

export const placeholderRooms: CollabRoom[] = [
    {
        id: 'r1',
        topic: 'Finals Prep Group - CS101',
        description: "Let's ace this final together!",
        type: 'private',
        createdBy: '1',
        members: ['1', '2'],
    },
    { id: 'r2', topic: 'History Buffs 🏛️', description: 'Discussing ancient civilizations.', type: 'private', createdBy: '2', members: ['2'] },
    { id: 'r3', topic: 'Physics Problems Help', description: 'Stuck on problem sets? Join us.', type: 'private', createdBy: '4', members: ['4', '1'] },
];

export const placeholderFocusSessions: FocusSession[] = [
    { id: 'fs1', userId: '1', duration: 50, date: Timestamp.fromDate(new Date('2024-08-01')), taskTag: 'History' },
    { id: 'fs2', userId: '1', duration: 25, date: Timestamp.fromDate(new Date('2024-08-01')), taskTag: 'Calculus' },
    { id: 'fs3', userId: '1', duration: 75, date: Timestamp.fromDate(new Date('2024-08-02')), taskTag: 'Physics' },
    { id: 'fs4', userId: '1', duration: 50, date: Timestamp.fromDate(new Date('2024-08-03')), taskTag: 'History' },
    { id: 'fs5', userId: '1', duration: 25, date: Timestamp.fromDate(new Date('2024-08-04')), taskTag: 'CS' },
    { id: 'fs6', userId: '1', duration: 100, date: Timestamp.fromDate(new Date('2024-08-05')), taskTag: 'Physics' },
    { id: 'fs7', userId: '1', duration: 50, date: Timestamp.fromDate(new Date('2024-08-06')), taskTag: 'Calculus' },
    { id: 'fs8', userId: '1', duration: 25, date: Timestamp.fromDate(new Date('2024-08-07')), taskTag: 'History' },
];

export const weeklyFocusData = [
  { date: "Mon", "This Week": 120, "Last Week": 90 },
  { date: "Tue", "This Week": 150, "Last Week": 110 },
  { date: "Wed", "This Week": 175, "Last Week": 160 },
  { date: "Thu", "This Week": 130, "Last Week": 140 },
  { date: "Fri", "This Week": 200, "Last Week": 150 },
  { date: "Sat", "This Week": 250, "Last Week": 180 },
  { date: "Sun", "This Week": 180, "Last Week": 220 },
];

export const taskCompletionData = [
    { date: 'Jul 29', completed: 5 },
    { date: 'Jul 30', completed: 7 },
    { date: 'Jul 31', completed: 6 },
    { date: 'Aug 01', completed: 9 },
    { date: 'Aug 02', completed: 8 },
    { date: 'Aug 03', completed: 10 },
    { date: 'Aug 04', completed: 7 },
]

export const adminUserStats = [
    { metric: "Total Users", value: "1,254", change: "+12%" },
    { metric: "Active Users (24h)", value: "302", change: "+5.2%" },
    { metric: "New Signups (7d)", value: "48", change: "-2.1%" },
];

export const adminContentStats = [
    { metric: "Total Notes", value: "4,821", change: "+50 this week" },
    { metric: "Total Downloads", value: "32,109", change: "+1.2k this week" },
    { metric: "Top Subject", value: "Computer Science", change: "" },
];

export const adminEngagementStats = [
    { metric: "Avg. Focus Time", value: "4.5h / week", change: "+0.5h" },
    { metric: "Tasks Completed", value: "12,934", change: "+890 this week" },
    { metric: "Active Rooms", value: "56", change: "+3" },
];
