"""The PM dispatcher holds an unconfirmed self-heal task OUT of dispatch.

The load-bearing invariant: a source='self_heal' task the loop opened must NOT
be routed / claimed / spawned while confirmed_by_human is False — it sits inert
until the CEO Approve-&-Starts it (which flips the flag). Once confirmed it
routes like any other task. Mirrors how PR-review tasks are skipped.
"""

from __future__ import annotations

from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock

import pytest
from roboco.runtime.orchestrator import AgentOrchestrator


def _task(tid: str, source: str, confirmed: bool) -> dict[str, Any]:
    return {
        "id": tid,
        "source": source,
        "confirmed_by_human": confirmed,
        "assigned_to": None,
    }


@pytest.mark.asyncio
async def test_unconfirmed_self_heal_task_is_held_out_of_dispatch() -> None:
    tasks = [
        _task("A", "self_heal", False),  # held — must NOT route until approved
        _task("B", "self_heal", True),  # CEO-approved → routes
        _task("C", "manual", False),  # ordinary task → routes
    ]
    stub = MagicMock()
    stub._fetch_tasks = AsyncMock(return_value=tasks)
    stub._is_task_handled_this_tick = MagicMock(return_value=False)
    stub._route_unassigned_pm_task = AsyncMock()

    client: Any = MagicMock()
    await AgentOrchestrator._dispatch_pm_work(cast("AgentOrchestrator", stub), client)

    routed = [c.args[1]["id"] for c in stub._route_unassigned_pm_task.await_args_list]
    assert "A" not in routed  # the unconfirmed self-heal task stays inert
    assert set(routed) == {"B", "C"}
