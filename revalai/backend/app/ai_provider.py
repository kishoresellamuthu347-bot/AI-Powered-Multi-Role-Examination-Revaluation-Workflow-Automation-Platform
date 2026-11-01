"""
AIProvider abstraction layer.

The rest of the application never calls an LLM/OCR SDK directly — it calls
get_ai_provider() and uses the AIProvider interface. This keeps the provider
swappable (OpenAI / Gemini / a local model) via the AI_PROVIDER env var,
without changing any calling code.

For this prototype, LocalMockProvider produces deterministic, realistic
output with no external API key required. To wire in a real model, implement
OpenAIProvider/GeminiProvider below using AI_API_KEY and switch AI_PROVIDER.
"""
import os
import random
import hashlib
from abc import ABC, abstractmethod
from typing import Tuple


class AIProvider(ABC):
    name: str = "AIProvider"

    @abstractmethod
    def run_ocr(self, application_code: str) -> str:
        ...

    @abstractmethod
    def analyze_answer(self, ocr_text: str, criteria: list) -> Tuple[float, float, float, str]:
        """Returns (suggested_marks, max_marks, confidence, explanation)."""
        ...


class LocalMockProvider(AIProvider):
    """Deterministic mock — same application always yields the same result,
    so the demo behaves consistently without needing network access."""
    name = "LocalMockProvider"

    SAMPLE_ANSWERS = [
        "The candidate correctly derives the recurrence relation T(n) = 2T(n/2) + O(n) "
        "and applies the Master Theorem to arrive at O(n log n). The merge step is "
        "explained with a worked example on an 8-element array. The best/worst case "
        "distinction is mentioned but not proven rigorously.",
        "The response defines deadlock avoidance and describes the Banker's Algorithm "
        "using Available, Max, Allocation and Need matrices, with a partially worked "
        "example for five processes. The safe-sequence check is described conceptually "
        "but the edge case of a request exceeding declared maximum is not addressed.",
        "The answer lists ACID properties and explains atomicity and consistency with "
        "examples from a banking transaction. Isolation is defined but the discussion "
        "of isolation levels (read committed, serializable) is incomplete.",
    ]

    def run_ocr(self, application_code: str) -> str:
        idx = int(hashlib.sha256(application_code.encode()).hexdigest(), 16) % len(self.SAMPLE_ANSWERS)
        return self.SAMPLE_ANSWERS[idx]

    def analyze_answer(self, ocr_text: str, criteria: list) -> Tuple[float, float, float, str]:
        random.seed(ocr_text)
        max_total = sum(c.max_marks for c in criteria) if criteria else 100
        # If criteria summed to an old smaller number (e.g. <= 25), scale to 100 marks standard
        if max_total <= 25:
            max_total = 100
        # Simulate ~75-88% attainment (e.g. 74 - 86 marks out of 100)
        ratio = 0.72 + (random.random() * 0.16)
        suggested = round(max_total * ratio)  # clean whole integer marks out of 100
        confidence = round(0.82 + random.random() * 0.14, 2)
        explanation = (
            "The candidate script shows comprehensive grasp of core syllabus topics and rubric criteria. "
            "Handwritten solutions demonstrate clear algorithmic derivations, step-by-step traces, and sound problem-solving. "
            "Minor penalties applied for incomplete boundary condition proofs. "
            "Evaluator confirmation is required for final grading."
        )
        return float(suggested), float(max_total), confidence, explanation


def get_ai_provider() -> AIProvider:
    provider = os.getenv("AI_PROVIDER", "local").lower()
    if provider in ("local", "mock", ""):
        return LocalMockProvider()
    # Extend here:
    # if provider == "openai": return OpenAIProvider(api_key=os.getenv("AI_API_KEY"))
    # if provider == "gemini": return GeminiProvider(api_key=os.getenv("AI_API_KEY"))
    return LocalMockProvider()
