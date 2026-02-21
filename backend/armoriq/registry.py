from typing import Dict, Any, List

class Registry:
    """
    Registry maintains the catalog of agents and their runtime states.
    In ArmorIQ, this is the single source of truth for agent health and models.
    """
    
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        
    def register_agent(self, agent_id: str, model_id: str):
        self.agents[agent_id] = {
            "agent_id": agent_id,
            "model_id": model_id,
            "status": "ONLINE",
            "last_active": None,
            "successful_participations": 0,
            "failed_participations": 0
        }
        
    def update_status(self, agent_id: str, status: str):
        if agent_id in self.agents:
            self.agents[agent_id]["status"] = status
            
    def record_participation(self, agent_id: str, success: bool, timestamp: str):
        if agent_id in self.agents:
            self.agents[agent_id]["last_active"] = timestamp
            if success:
                self.agents[agent_id]["successful_participations"] += 1
            else:
                self.agents[agent_id]["failed_participations"] += 1

    def get_agent_catalog(self) -> List[Dict[str, Any]]:
        return list(self.agents.values())
