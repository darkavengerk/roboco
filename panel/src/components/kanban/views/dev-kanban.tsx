"use client";

import { useState } from "react";
import { TaskStatus, Team } from "@/types";
import { KanbanBoard } from "../core/kanban-board";

const DEV_COLUMNS = [
  { id: "backlog", status: TaskStatus.BACKLOG, title: "구상", color: "bg-slate-50 dark:bg-slate-900" },
  { id: "pending", status: TaskStatus.PENDING, title: "집필 대기", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "assigned", status: TaskStatus.CLAIMED, title: "배정됨", color: "bg-blue-50 dark:bg-blue-950" },
  { id: "in-progress", status: TaskStatus.IN_PROGRESS, title: "집필 중", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "blocked", status: TaskStatus.BLOCKED, title: "보류", color: "bg-red-50 dark:bg-red-950" },
  { id: "verifying", status: TaskStatus.VERIFYING, title: "자기 퇴고", color: "bg-purple-50 dark:bg-purple-950" },
  { id: "qa-review", status: TaskStatus.AWAITING_QA, title: "편집 중", color: "bg-yellow-50 dark:bg-yellow-950" },
  { id: "done", status: TaskStatus.COMPLETED, title: "확정", color: "bg-green-50 dark:bg-green-950" },
];

interface DevKanbanProps {
  initialTeam?: Team;
}

export function DevKanban({ initialTeam }: DevKanbanProps) {
  const [team, setTeam] = useState<Team | undefined>(initialTeam);

  return (
    <KanbanBoard
      title="Dev Kanban"
      description="Developer workflow from backlog to completion"
      columns={DEV_COLUMNS}
      teamFilter={team}
      onTeamChange={(t) => setTeam(t === "all" ? undefined : t)}
    />
  );
}
