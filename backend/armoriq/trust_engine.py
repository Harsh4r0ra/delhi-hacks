import json
import os
import time
from typing import Dict, Any, List

class TrustEngine:
    """
    Manages trust scores and reputation for agents in the consensus network.
    Scores decay or grow based on accuracy, consistency, and speed.
    """
    def __init__(self, persist_path: str = "trust_scores.json"):
        self.persist_path = persist_path
        # format: { agent_id: { "score": 1.0, "total_participations": 0, "agreements": 0, "disagreements": 0 } }
        self.scores: Dict[str, Dict[str, Any]] = {}
        self.history: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.persist_path):
            try:
                with open(self.persist_path, "r") as f:
                    data = json.load(f)
                    self.scores = data.get("scores", {})
                    self.history = data.get("history", [])
            except Exception:
                pass

        # Ensure default scores exist for expected agents if empty
        if not self.scores:
            for i in range(1, 5):
                aid = f"agent_{i}"
                self.scores[aid] = {
                    "score": 100.0,
                    "total_participations": 0,
                    "agreements": 0,
                    "disagreements": 0,
                    "avg_latency_ms": 0
                }

    def _save(self):
        try:
            with open(self.persist_path, "w") as f:
                json.dump({"scores": self.scores, "history": self.history}, f, indent=2)
        except Exception:
            pass

    def evaluate_round(self, final_decision: str, agent_results: dict, round_latency_ms: int):
        """
        Update trust scores based on round results.
        If an agent agrees with the consensus, trust goes up slightly.
        If an agent disagrees (or faults), trust goes down significantly.
        """
        round_record = {
            "timestamp": time.time(),
            "decision": final_decision,
            "agent_deltas": {}
        }

        for agent_id, result in agent_results.items():
            if agent_id not in self.scores:
                self.scores[agent_id] = {
                    "score": 100.0,
                    "total_participations": 0,
                    "agreements": 0,
                    "disagreements": 0,
                    "avg_latency_ms": 0
                }
            
            stats = self.scores[agent_id]
            stats["total_participations"] += 1
            
            # Simple latency moving average
            stats["avg_latency_ms"] = int((stats["avg_latency_ms"] * 0.9) + (round_latency_ms * 0.1)) if stats["avg_latency_ms"] > 0 else round_latency_ms

            delta = 0.0
            agent_decision = result.get("decision")
            status = result.get("status")

            if status != "OK":
                # Timeout or Error -> heavy penalty
                delta = -15.0
                stats["disagreements"] += 1
            elif agent_decision == final_decision:
                # Agreed with consensus -> small reward
                delta = 1.5
                stats["agreements"] += 1
            else:
                # Active disagreement -> medium penalty
                delta = -10.0
                stats["disagreements"] += 1

            new_score = max(0.0, min(100.0, stats["score"] + delta))
            stats["score"] = new_score
            round_record["agent_deltas"][agent_id] = round(delta, 2)

        self.history.append(round_record)
        if len(self.history) > 50:
            self.history = self.history[-50:]

        self._save()
