"""Base node implementation for AIC Flow."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
from aic_flow.graph.state import State


@dataclass
class BaseNode(ABC):
    """Base class for all nodes in the flow."""

    name: str

    @abstractmethod
    def __call__(self, state: State) -> dict[str, Any]:  # pragma: no cover
        """Execute the node."""
        pass
