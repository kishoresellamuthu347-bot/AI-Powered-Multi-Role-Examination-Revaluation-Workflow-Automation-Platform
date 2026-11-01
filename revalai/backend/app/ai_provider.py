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
        max_total = sum(c.max_marks for c in criteria) if criteria else 15
        # Simulate ~75-90% attainment with mild randomness, deterministic per answer
        ratio = 0.72 + (random.random() * 0.18)
        suggested = round(max_total * ratio * 2) / 2  # nearest 0.5
        confidence = round(0.78 + random.random() * 0.17, 2)
        explanation = (
            "The response addresses the core concept and most rubric criteria with "
            "correct terminology and a worked example. A minor gap remains in edge-case "
            "or complexity justification, consistent with the marks withheld below. "
            "This is a suggestion only — the assigned evaluator holds final authority "
            "over the awarded mark."
        )
        return suggested, max_total, confidence, explanation


def get_ai_provider() -> AIProvider:
    provider = os.getenv("AI_PROVIDER", "local").lower()
    if provider in ("local", "mock", ""):
        return LocalMockProvider()
    # Extend here:
    # if provider == "openai": return OpenAIProvider(api_key=os.getenv("AI_API_KEY"))
    # if provider == "gemini": return GeminiProvider(api_key=os.getenv("AI_API_KEY"))
    return LocalMockProvider()
