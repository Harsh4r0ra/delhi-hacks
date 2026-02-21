from typing import Any, Dict
from pydantic import BaseModel

class PBFTMessage(BaseModel):
    agent_id: str
    view_number: int
    sequence_number: int
    signature: str = ""

class PrePrepare(PBFTMessage):
    request_hash: str
    request: Dict[str, Any]

class Prepare(PBFTMessage):
    request_hash: str

class Commit(PBFTMessage):
    request_hash: str
    result_hash: str
    result: Dict[str, Any]

class ViewChange(PBFTMessage):
    new_view: int

class NewView(PBFTMessage):
    new_view: int
    view_changes: list  # list of signed ViewChange messages
