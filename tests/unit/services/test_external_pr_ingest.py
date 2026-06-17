"""External-PR review dedup — review once per (project, PR, head commit).

``external_review_task_exists`` drives re-review off the PR's head SHA: an
unchanged PR (same head) is skipped, new commits (a new head SHA) open a fresh
review, and legacy/unknown-SHA tasks are never re-reviewed (no spam).
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from roboco.services.task import TaskService


def _service(quick_contexts: list[str | None]) -> TaskService:
    """A TaskService whose review-task query returns these quick_context values."""
    res = MagicMock()
    res.scalars.return_value.all.return_value = quick_contexts
    session = MagicMock()
    session.execute = AsyncMock(return_value=res)
    return TaskService(session)


@pytest.mark.asyncio
async def test_no_task_yet_ingests() -> None:
    svc = _service([])
    assert await svc.external_review_task_exists(uuid4(), 170, "abc") is False


@pytest.mark.asyncio
async def test_same_head_sha_skips() -> None:
    svc = _service(["external_pr_head=abc"])
    assert await svc.external_review_task_exists(uuid4(), 170, "abc") is True


@pytest.mark.asyncio
async def test_new_head_sha_rereviews() -> None:
    # PR got new commits since the last review → open a fresh review.
    svc = _service(["external_pr_head=abc"])
    assert await svc.external_review_task_exists(uuid4(), 170, "def") is False


@pytest.mark.asyncio
async def test_legacy_markerless_task_not_rereviewed() -> None:
    # A task ingested before head-SHA tracking existed → don't re-review it.
    svc = _service([None])
    assert await svc.external_review_task_exists(uuid4(), 170, "def") is True


@pytest.mark.asyncio
async def test_unknown_head_sha_does_not_spam() -> None:
    # Can't detect change (no SHA from GitHub) → treat as reviewed.
    svc = _service(["external_pr_head=abc"])
    assert await svc.external_review_task_exists(uuid4(), 170, None) is True


@pytest.mark.asyncio
async def test_multiple_old_shas_still_rereviews_new() -> None:
    svc = _service(["external_pr_head=abc", "external_pr_head=def"])
    assert await svc.external_review_task_exists(uuid4(), 170, "ghi") is False
    assert await svc.external_review_task_exists(uuid4(), 170, "def") is True
