"""Base node implementation for AIC Flow."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
from aic_flow.graph.state import State


@dataclass
class BaseNode(ABC):
    """Base class for all nodes in the flow."""

    name: str

    def decode_variables(self, state: State) -> None:
        """Decode the variables in attributes of the node."""
        for key, value in self.__dict__.items():
            if isinstance(value, str) and "{{" in value:
                # Extract path from {{path.to.value}} format
                path = value.strip("{}").split(".")
                result = state["outputs"]
                for part in path:
                    result = result[part]
                self.__dict__[key] = result

    async def __call__(self, state: State) -> dict[str, Any]:  # pragma: no cover
        """Execute the node."""
        self.decode_variables(state)
        result = await self.run(state)
        return {"outputs": {self.name: result}}

    @abstractmethod
    async def run(self, state: State) -> dict[str, Any]:
        """Run the node."""
        pass
