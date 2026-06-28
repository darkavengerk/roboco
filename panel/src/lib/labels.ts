/**
 * Central display labels (Korean — fiction-studio reskin).
 *
 * Single source of truth for the human-readable strings the panel shows for
 * the frozen backend enum VALUES. The enum identifiers themselves
 * (developer / backend / awaiting_qa / ...) stay English in code and DB; only
 * what the reader sees is Korean + novel-themed. Keeping every label in one
 * module means the scattered per-component maps can't drift, and upstream
 * stays merge-clean (this file is new — nothing upstream owns it).
 *
 * Typed as Record<string, string> so a call site can index by either the typed
 * enum member or a raw string from the API.
 */
import { AgentRole, Team, TaskStatus, TaskType } from "@/types";

// Agent role → display (editorial / writing roles)
export const ROLE_LABELS: Record<string, string> = {
  [AgentRole.SYSTEM]: "시스템",
  [AgentRole.CEO]: "작가",
  [AgentRole.PRODUCT_OWNER]: "기획 편집",
  [AgentRole.HEAD_MARKETING]: "독자·시장",
  [AgentRole.AUDITOR]: "감수",
  [AgentRole.PR_REVIEWER]: "원고 심사역",
  [AgentRole.MAIN_PM]: "총괄 편집장",
  [AgentRole.CELL_PM]: "섹션 편집",
  [AgentRole.DEVELOPER]: "초고 작가",
  [AgentRole.QA]: "편집자",
  [AgentRole.DOCUMENTER]: "설정 편집",
  [AgentRole.PROMPTER]: "기획 인터뷰",
  [AgentRole.SECRETARY]: "비서실",
};

// Team / section → display
export const TEAM_LABELS: Record<string, string> = {
  [Team.BOARD]: "편집위원회",
  [Team.MAIN_PM]: "편집국",
  [Team.BACKEND]: "구조팀",
  [Team.FRONTEND]: "문장팀",
  [Team.UX_UI]: "연출팀",
  [Team.MARKETING]: "독자·시장",
  // defensive group keys some views emit beyond the Team enum
  support: "지원",
  management: "편집국",
};

// Task status → display (the manuscript pipeline)
export const STATUS_LABELS: Record<string, string> = {
  [TaskStatus.BACKLOG]: "구상",
  [TaskStatus.PENDING]: "집필 대기",
  [TaskStatus.CLAIMED]: "배정됨",
  [TaskStatus.IN_PROGRESS]: "집필 중",
  [TaskStatus.BLOCKED]: "보류",
  [TaskStatus.PAUSED]: "중단",
  [TaskStatus.VERIFYING]: "자기 퇴고",
  [TaskStatus.NEEDS_REVISION]: "수정 요청",
  [TaskStatus.AWAITING_QA]: "편집 대기",
  [TaskStatus.AWAITING_DOCUMENTATION]: "설정 반영 대기",
  [TaskStatus.AWAITING_PR_REVIEW]: "원고 심사",
  [TaskStatus.AWAITING_PM_REVIEW]: "총괄 검토",
  [TaskStatus.AWAITING_CEO_APPROVAL]: "작가 승인 대기",
  [TaskStatus.COMPLETED]: "원고 확정",
  [TaskStatus.CANCELLED]: "폐기",
};

// Task type → display
export const TASK_TYPE_LABELS: Record<string, string> = {
  [TaskType.CODE]: "집필",
  [TaskType.DOCUMENTATION]: "설정·교정",
  [TaskType.RESEARCH]: "자료조사",
  [TaskType.PLANNING]: "기획",
  [TaskType.DESIGN]: "연출",
  [TaskType.ADMINISTRATIVE]: "행정",
};
