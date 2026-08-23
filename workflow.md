# Master Project Workflow and Architecture

## 1. Project Philosophy (Agent Directives)

This project is built in cumulative stages called Milestones.

- Do not delete or overwrite the functionality of previous milestones when building a new one.
- Modular design: each milestone must be built as an independent component or module that can be rendered in isolation.
- Aggregated view: the system must also support a master view where all milestones can be displayed together seamlessly.

## 2. Core Architecture: Shell and Navigation

The application consists of a persistent global shell and dynamic content areas.

- Global navbar: the application must have a persistent top or side navigation bar.
- Navigation logic: the navbar must contain links/buttons for:
  - Milestone 1
  - Milestone 2
  - Milestone 3
  - Full Project (Aggregated View)
- View switching: clicking a navbar link must swap the main content area to display only that milestone, or all milestones for the aggregated view.

## 3. Milestone Integration Workflow

When instructed to start a new milestone, follow these exact steps:

1. Review context: read the specific requirements for the new milestone.
2. Scaffold the module: create new files/components for this milestone in an isolated directory or scoped structure (for example, /components/milestone2/).
3. Build the logic: implement required backend/frontend logic for the current milestone without modifying the internal logic of previous milestones.
4. Wire the navigation: update the global navbar to include the new milestone.
5. Update the aggregated view: ensure the new milestone is imported and displayed correctly in Full Project view.
6. Self-correction: verify switching between previous milestones still works and that no global state was corrupted.

## 4. Evaluation Criteria Structure

Every milestone view must clearly display its specific UI.

If a milestone requires a specific test interface (for example, a form to test sorting/filtering algorithms), that interface must only be visible when that specific milestone (or the aggregated view) is active.

## 5. Local Navigation Commands

Use this single command to navigate all milestones from the same localhost entry point.

### Terminal 1 (shell + Milestone 1, 2, and 3)

```bash
cd /workspaces/LEONARD-PROJECT-MILESSTONE
npx --yes serve . -l 3000
```

### Open the unified navbar

- http://localhost:3000/project-shell.html

From this page, use the navbar to switch Milestone 1, Milestone 2, Milestone 3, and Full Project.
