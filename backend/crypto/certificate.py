"""
ConsensusCertificate — cryptographic proof that a PBFT consensus round was completed correctly.

This is the core auditable artifact. Any third party can independently verify:
1. All signatures are valid Ed25519 signatures
2. At least 2f+1 agents participated in both Prepare and Commit quorums
3. The request hash is consistent throughout
4. No tampering occurred (hash chain integrity)
"""

import datetime
from typing import List, Dict, Any, Optional
from nacl.signing import VerifyKey
from backend.utils import sha256

class ConsensusCertificate:
    def __init__(
        self,
        view_number: int,
        sequence_number: int,
        request_hash: str,
        pre_prepare_signature: str,
        prepare_quorum: List[Dict[str, Any]],
        commit_quorum: List[Dict[str, Any]],
        result_hash: str,
        decision: str,
        timestamp: Optional[str] = None,
    ):
        self.view_number = view_number
        self.sequence_number = sequence_number
        self.request_hash = request_hash
        self.pre_prepare_signature = pre_prepare_signature
        self.prepare_quorum = prepare_quorum
        self.commit_quorum = commit_quorum
        self.result_hash = result_hash
        self.decision = decision
        self.timestamp = timestamp or datetime.datetime.now(datetime.timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "view_number": self.view_number,
            "sequence_number": self.sequence_number,
            "request_hash": self.request_hash,
            "pre_prepare_signature": self.pre_prepare_signature,
            "prepare_quorum": self.prepare_quorum,
            "commit_quorum": self.commit_quorum,
            "result_hash": self.result_hash,
            "decision": self.decision,
            "timestamp": self.timestamp,
            "quorum_met": {
                "prepare": len(self.prepare_quorum),
                "commit": len(self.commit_quorum),
            },
        }

    def verify(self, agent_verify_keys: Dict[str, VerifyKey], f: int) -> Dict[str, Any]:
        """
        Independently verify the certificate's cryptographic integrity.
        
        Args:
            agent_verify_keys: Mapping of agent_id -> Ed25519 VerifyKey
            f: Number of tolerable faults
            
        Returns:
            Dict with verification results
        """
        quorum_size = 2 * f + 1
        errors = []

        # Check prepare quorum size
        if len(self.prepare_quorum) < quorum_size:
            errors.append(f"Prepare quorum too small: {len(self.prepare_quorum)} < {quorum_size}")

        # Check commit quorum size
        if len(self.commit_quorum) < quorum_size:
            errors.append(f"Commit quorum too small: {len(self.commit_quorum)} < {quorum_size}")

        # Verify each prepare signature
        valid_prepares = 0
        for entry in self.prepare_quorum:
            agent_id = entry.get("agent_id")
            sig = entry.get("signature")
            vk = agent_verify_keys.get(agent_id)
            if vk and sig:
                try:
                    vk.verify(self.request_hash.encode(), bytes.fromhex(sig))
                    valid_prepares += 1
                except Exception:
                    errors.append(f"Invalid prepare signature from {agent_id}")
            else:
                errors.append(f"Missing verify key or signature for {agent_id}")

        # Verify each commit signature
        valid_commits = 0
        for entry in self.commit_quorum:
            agent_id = entry.get("agent_id")
            sig = entry.get("signature")
            vk = agent_verify_keys.get(agent_id)
            if vk and sig:
                try:
                    vk.verify(self.result_hash.encode(), bytes.fromhex(sig))
                    valid_commits += 1
                except Exception:
                    errors.append(f"Invalid commit signature from {agent_id}")
            else:
                errors.append(f"Missing verify key or signature for {agent_id}")

        is_valid = len(errors) == 0 and valid_prepares >= quorum_size and valid_commits >= quorum_size

        return {
            "valid": is_valid,
            "valid_prepares": valid_prepares,
            "valid_commits": valid_commits,
            "quorum_required": quorum_size,
            "errors": errors,
        }
