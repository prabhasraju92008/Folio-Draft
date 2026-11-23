import type { SamplePreset } from "../types";

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "frontend-intern",
    label: "Frontend Intern",
    input: {
      name: "Ananya Rao",
      degree: "B.Tech in Computer Science, IIIT Hyderabad (Expected May 2027)",
      skills: "TypeScript, React, Next.js, Tailwind CSS, REST APIs, Accessibility (WCAG), Git, Figma",
      experience:
        "Software Engineering Intern at FinLedger (Summer 2026): rebuilt the invoice reconciliation table in React and TypeScript, cutting load latency by 38% and adding keyboard navigation. Built CampusPulse, an open-source course timetable planner used by 1,200+ students.",
      company: "Linear",
      role: "Frontend Engineering Intern",
      jobDescription:
        "We are looking for a Frontend Engineering Intern to help craft fast, keyboard-first web interfaces in React and TypeScript. You will collaborate closely with product designers to ship accessible UI components, optimize client-side rendering performance, and iterate quickly on user feedback.",
      tone: "balanced",
    },
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    input: {
      name: "Daniel Kim",
      degree: "B.S. in Statistics & Economics, University of Michigan (2026)",
      skills: "SQL (PostgreSQL), Python (pandas, scikit-learn), Tableau, Excel modeling, A/B Testing, Cohort Analysis",
      experience:
        "Analytics Intern at MetroRide Transit: wrote SQL pipelines analyzing 2.4M rider trips to uncover off-peak route bottlenecks, helping operations reduce wait times by 11%. Capstone Project: built a churn prediction model for a subscription e-commerce dataset with 0.84 ROC-AUC and an interactive Tableau dashboard.",
      company: "Spotify",
      role: "Junior Product Data Analyst",
      jobDescription:
        "Join our Growth Analytics team to turn large-scale listener behavior into product decisions. You will write clean SQL queries, design and interpret A/B experiments, build self-serve dashboards, and partner with product managers to improve subscriber retention.",
      tone: "confident",
    },
  },
  {
    id: "product-designer",
    label: "Product Designer",
    input: {
      name: "Maya Patel",
      degree: "B.Des in Interaction Design, Rhode Island School of Design (2026)",
      skills: "Figma, Design Systems, User Research, Rapid Prototyping, Usability Testing, Information Architecture, HTML/CSS",
      experience:
        "Product Design Intern at CareLoop Health: redesigned the patient appointment rescheduling flow after interviewing 18 clinic patients, lowering drop-off by 24% during pilot testing. Studio Project: created a modular Figma component library and interactive prototype for a financial literacy app for first-time renters.",
      company: "Notion",
      role: "Associate Product Designer",
      jobDescription:
        "We are seeking an Associate Product Designer who cares deeply about craft, clarity, and systems thinking. You will take ambiguous workflows from user research and low-fidelity exploration through polished Figma prototypes, partnering with engineers to ship cohesive features across desktop and web.",
      tone: "concise",
    },
  },
];
