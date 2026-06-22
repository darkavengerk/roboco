"""Self-heal fix tasks dispatch autonomously through the PM dispatcher.

The loop opens a ``source='self_heal'`` task confirmed + assigned to the Main PM
agent, so the dispatcher routes it through the assigned-PM path like any other
task — there is no CEO Approve-&-Start hold (that gate is the Intake/board flow).
"""

from __future__ import annotations

from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock

import pytest
from roboco.runtime.orchestrator import AgentOrchestrator


def _task(tid: str, source: str, assigned_to: str | None = None) -> dict[str, Any]:
    return {"id": tid, "source": source, "assigned_to": assigned_to}


@pytest.mark.asyncio
async def test_self_heal_task_dispatches_through_the_assigned_pm_path() -> None:
    tasks = [
        _task("A", "self_heal", assigned_to="main-pm"),  # assigned → assigned-PM path
        _task("B", "self_heal"),  # unassigned self-heal → routing
        _task("C", "manual"),  # ordinary unassigned → routing
    ]
    stub = MagicMock()
    stub._fetch_tasks = AsyncMock(return_value=tasks)
    stub._is_task_handled_this_tick = MagicMock(return_value=False)
    stub._resolve_agent_slug = MagicMock(return_value="main-pm")
    stub._BOARD_AGENTS = frozenset()
    stub._route_unassigned_pm_task = AsyncMock()
    stub._handle_pm_assigned_task = AsyncMock()
    stub._handle_board_assigned_task = AsyncMock()

    client: Any = MagicMock()
    await AgentOrchestrator._dispatch_pm_work(cast("AgentOrchestrator", stub), client)

    # The assigned self-heal task is handed to the assigned-PM path (spawned),
    # NOT held — it dispatches without any CEO approval.
    handled = [c.args[0]["id"] for c in stub._handle_pm_assigned_task.await_args_list]
    assert handled == ["A"]
    # Unassigned tasks (self-heal or not) route normally.
    routed = [c.args[1]["id"] for c in stub._route_unassigned_pm_task.await_args_list]
    assert set(routed) == {"B", "C"}
