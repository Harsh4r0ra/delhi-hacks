import json
import hashlib
from typing import Dict, Any

def canonical_json(data: Dict[str, Any]) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"))

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()
