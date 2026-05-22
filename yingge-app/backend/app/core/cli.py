"""Small command wrappers exposed through pyproject scripts."""

import subprocess
import sys


def _run(command: list[str]) -> None:
    """Run a local developer command and return its exit code."""
    completed = subprocess.run(command, check=False)
    sys.exit(completed.returncode)


def run_tests() -> None:
    """Run the test suite."""
    _run(["pytest"])


def run_lint() -> None:
    """Run Ruff lint checks."""
    _run(["ruff", "check", "app", "tests"])


def run_format() -> None:
    """Run Ruff formatter."""
    _run(["ruff", "format", "app", "tests"])
