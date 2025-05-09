import pytest
from aic_flow.graph.state import State
from aic_flow.nodes.code import PythonCodeNode


def test_basic_code_execution():
    state = {}
    node = PythonCodeNode("python_node", "return 3")
    output = node(state)
    assert output["outputs"] == 3


def test_code_without_result():
    state = {}
    node = PythonCodeNode("python_node", "x = 1; y = 2; return None")
    with pytest.raises(ValueError):
        node(state)


def test_code_with_state():
    state = {
        "outputs": [
            {"x": 1, "y": 2},
            {"x": 2, "y": 3},
        ]
    }
    node = PythonCodeNode(
        "python_node",
        """
x = state["outputs"][-1]["x"]
y = state["outputs"][-1]["y"]
a = x * 2
b = y + 1
result = a + b
return result
""",
    )
    output = node(state)
    assert output["outputs"] == 8


def test_code_with_error():
    node = PythonCodeNode("python_node", "result = undefined_var; return result")
    state = State({})
    with pytest.raises(NameError):
        node(state)


def test_code_with_imports():
    state = {}
    node = PythonCodeNode(
        "python_node",
        """
import math
result = math.pi
return result
""",
    )
    output = node(state)
    assert output["outputs"] == 3.141592653589793
