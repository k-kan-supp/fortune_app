# Alembic の autogenerate が全モデルを検出できるよう、ここで import しておく。
from app.models.matching import Block, Like, Match, MatchRead, Message, Report
from app.models.profile import UserProfile
from app.models.user import MagicLinkToken, User

__all__ = [
    "User",
    "MagicLinkToken",
    "UserProfile",
    "Like",
    "Match",
    "Message",
    "MatchRead",
    "Block",
    "Report",
]
