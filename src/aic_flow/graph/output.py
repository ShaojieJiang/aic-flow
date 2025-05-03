"""Output handling for the workflow."""

from __future__ import annotations
from collections.abc import Callable
from functools import partial
from typing import Any, cast


Outputs = list[Any] | Any


def _add_outputs_wrapper(func: Callable) -> Callable[[Outputs, Outputs], Outputs]:
    def _add_outputs(
        left: Outputs | None = None, right: Outputs | None = None, **kwargs: Any
    ) -> Outputs | Callable[[Outputs, Outputs], Outputs]:
        if left is not None and right is not None:
            return func(left, right, **kwargs)
        elif left is not None or right is not None:
            msg = (
                f"Must specify non-null arguments for both 'left' and 'right'. "
                f"Only received: '{'left' if left else 'right'}' "
                f"with value: {left if left else right}."
            )
            raise ValueError(msg)
        else:
            return partial(func, **kwargs)

    _add_outputs.__doc__ = func.__doc__
    return cast(Callable[[Outputs, Outputs], Outputs], _add_outputs)


@_add_outputs_wrapper
def add_outputs(left: Outputs, right: Outputs) -> Outputs:
    """Merges two lists of outputs, appending new outputs to the existing list.

    Args:
        left: The base list of outputs.
        right: The list of outputs (or single output) to append to the base list.

    Returns:
        A new list with outputs from `right` appended to `left`.
    """
    if not isinstance(left, list):
        left = [left]
    if not isinstance(right, list):
        right = [right]
    return left + right
