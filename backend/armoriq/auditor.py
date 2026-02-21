import json
import sqlite3
import datetime
from typing import Dict, Any, Optional

class Auditor:
    """
    Auditor stores immutable proofs of all AI actions.
    Links Intent -> Gatekeeper -> Sentry -> PBFT Consensus Proof.
    """
    
    def __init__(self, db_path: str = "audit.db"):
        self.db_path = db_path
        self._init_db()
        
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    intent_id TEXT,
                    timestamp TEXT,
                    risk_level TEXT,
                    action_type TEXT,
                    target TEXT,
                    consensus_reached BOOLEAN,
                    consensus_cert TEXT,
                    sentry_validation BOOLEAN
                )
            """)
            
    def log_execution(self, intent: Any, consensus_cert: Optional[Any], sentry_valid: bool) -> int:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cert_json = json.dumps(consensus_cert.to_dict()) if consensus_cert else None
            is_reached = consensus_cert is not None
            
            cursor.execute("""
                INSERT INTO audit_logs (
                    intent_id, timestamp, risk_level, action_type, target, 
                    consensus_reached, consensus_cert, sentry_validation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                getattr(intent, "intent_id", "UNKNOWN"),
                datetime.datetime.utcnow().isoformat() + "Z",
                getattr(intent, "risk_level", "UNKNOWN"),
                getattr(intent, "action_type", "UNKNOWN"),
                getattr(intent, "target", "UNKNOWN"),
                is_reached,
                cert_json,
                sentry_valid
            ))
            return cursor.lastrowid
            
    def get_history(self, limit: int = 50) -> list:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]
