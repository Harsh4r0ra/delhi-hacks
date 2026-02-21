from nacl.signing import SigningKey

class AgentIdentity:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key

    def sign(self, message: str) -> str:
        return self.signing_key.sign(message.encode()).signature.hex()

    @staticmethod
    def verify(message: str, signature_hex: str, verify_key) -> bool:
        try:
            verify_key.verify(message.encode(), bytes.fromhex(signature_hex))
            return True
        except Exception:
            return False
