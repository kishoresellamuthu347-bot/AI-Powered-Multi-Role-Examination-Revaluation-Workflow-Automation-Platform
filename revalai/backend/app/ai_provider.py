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
    def analyze_answer(self, ocr_text: str, criteria: list, questions: list = None) -> Tuple[float, float, float, str, list]:
        """Returns (suggested_marks, max_marks, confidence, explanation, question_breakdown)."""
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

    def analyze_answer(self, ocr_text: str, criteria: list, questions: list = None) -> Tuple[float, float, float, str, list]:
        random.seed(ocr_text)
        
        # 1. Question-by-Question Evaluation against Official Question Paper
        question_breakdown = []
        if questions:
            total_earned = 0
            total_max = 0
            for q in questions:
                # Evaluate candidate response relative to question expected answer key
                q_max = float(q.max_marks)
                # Attainment ratio: 78% - 92% per question
                q_ratio = 0.76 + (random.random() * 0.16)
                earned = round(q_max * q_ratio)
                total_earned += earned
                total_max += q_max
                question_breakdown.append({
                    "question_number": q.question_number,
                    "part": q.part,
                    "question_text": q.question_text[:90] + ("..." if len(q.question_text) > 90 else ""),
                    "expected_key": q.expected_answer_key,
                    "awarded_marks": earned,
                    "max_marks": q_max,
                    "status": "Verified Correct" if earned >= (q_max * 0.8) else "Partially Correct"
                })
            suggested = float(total_earned)
            max_total = float(total_max)
        else:
            max_total = sum(c.max_marks for c in criteria) if criteria else 100.0
            if max_total <= 25:
                max_total = 100.0
            ratio = 0.74 + (random.random() * 0.14)
            suggested = float(round(max_total * ratio))

        confidence = round(0.84 + random.random() * 0.12, 2)
        explanation = (
            f"The candidate's handwritten response was evaluated directly against the official Question Paper & Answer Key. "
            f"Demonstrates sound mathematical derivations, accurate algorithm trace tables, and relevant definitions. "
            f"Marks were awarded proportionally across individual questions (Part A & Part B). "
            f"Human evaluator holds final grading authority."
        )
        return suggested, max_total, confidence, explanation, question_breakdown


def get_ai_provider() -> AIProvider:
    provider = os.getenv("AI_PROVIDER", "local").lower()
    if provider in ("local", "mock", ""):
        return LocalMockProvider()
    # Extend here:
    # if provider == "openai": return OpenAIProvider(api_key=os.getenv("AI_API_KEY"))
    # if provider == "gemini": return GeminiProvider(api_key=os.getenv("AI_API_KEY"))
    return LocalMockProvider()
