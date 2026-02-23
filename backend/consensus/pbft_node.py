from typing import Dict, Any, List, Optional
from backend.consensus.messages import PrePrepare, Prepare, Commit, ViewChange
from backend.crypto.identity import AgentIdentity
from backend.utils import canonical_json, sha256

class PBFTNode:
    def __init__(self, agent_id: str, identity: AgentIdentity, f: int):
        self.agent_id = agent_id
        self.identity = identity
        self.f = f
        self.quorum_size = 2 * f + 1
        
        self.view_number = 0
        self.sequence_number = 0
        
        # message logs
        self.pre_prepares: Dict[int, Dict[int, Dict[str, PrePrepare]]] = {}
        self.prepares: Dict[int, Dict[int, Dict[str, List[Prepare]]]] = {}
        self.commits: Dict[int, Dict[int, Dict[str, List[Commit]]]] = {}

    def on_view_change(self, new_view: int) -> ViewChange:
        """Transitions node to a new view and generates a signed ViewChange message."""
        self.view_number = new_view
        vc = ViewChange(
            agent_id=self.agent_id,
            view_number=self.view_number,
            sequence_number=self.sequence_number,
            new_view=new_view,
        )
        payload = canonical_json(vc.model_dump(exclude={"signature"}))
        vc.signature = self.identity.sign(payload)
        return vc

    def on_pre_prepare(self, msg: PrePrepare) -> Optional[Prepare]:
        """Receives a Pre-Prepare message. Returns a Prepare message to broadcast if valid."""
        if msg.view_number < self.view_number:
            return None
        
        self.pre_prepares.setdefault(msg.view_number, {}).setdefault(msg.sequence_number, {})[msg.request_hash] = msg
        
        prep = Prepare(
            agent_id=self.agent_id,
            view_number=msg.view_number,
            sequence_number=msg.sequence_number,
            request_hash=msg.request_hash
        )
        
        payload = canonical_json(prep.model_dump(exclude={"signature"}))
        prep.signature = self.identity.sign(payload)
        
        return prep

    def on_prepare(self, msg: Prepare, result: Dict[str, Any]) -> Optional[Commit]:
        """Receives a Prepare message. Returns a Commit message to broadcast if prepared (quorum reached)."""
        self.prepares.setdefault(msg.view_number, {}).setdefault(msg.sequence_number, {}).setdefault(msg.request_hash, []).append(msg)
        
        if self.is_prepared(msg.view_number, msg.sequence_number, msg.request_hash):
            result_hash = sha256(canonical_json(result))
            
            com = Commit(
                agent_id=self.agent_id,
                view_number=msg.view_number,
                sequence_number=msg.sequence_number,
                request_hash=msg.request_hash,
                result_hash=result_hash,
                result=result
            )
            
            payload = canonical_json(com.model_dump(exclude={"signature"}))
            com.signature = self.identity.sign(payload)
            
            return com
        return None

    def on_commit(self, msg: Commit) -> bool:
        """Receives a Commit message. Returns True if committed (quorum reached)."""
        self.commits.setdefault(msg.view_number, {}).setdefault(msg.sequence_number, {}).setdefault(msg.request_hash, []).append(msg)
        return self.is_committed(msg.view_number, msg.sequence_number, msg.request_hash)

    def is_prepared(self, view: int, seq: int, req_hash: str) -> bool:
        prepares = self.prepares.get(view, {}).get(seq, {}).get(req_hash, [])
        return len(prepares) >= self.quorum_size

    def is_committed(self, view: int, seq: int, req_hash: str) -> bool:
        commits = self.commits.get(view, {}).get(seq, {}).get(req_hash, [])
        return len(commits) >= self.quorum_size
