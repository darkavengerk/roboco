"""The toolchain-match subsystem is gated by a default-off flag."""

from __future__ import annotations

from roboco.config import Settings


def test_toolchain_match_disabled_by_default() -> None:
    assert Settings().toolchain_match_enabled is False


def test_toolchain_match_reads_env(monkeypatch) -> None:
    monkeypatch.setenv("ROBOCO_TOOLCHAIN_MATCH_ENABLED", "true")
    assert Settings().toolchain_match_enabled is True
