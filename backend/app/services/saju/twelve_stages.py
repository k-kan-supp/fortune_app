"""十二運星（日主が各地支で持つ勢い）の判定。"""

from app.services.saju.constants import (
    EARTHLY_BRANCHES,
    STAGE_ORIGIN_BRANCH,
    STEM_YANG,
    TWELVE_STAGES,
)


def twelve_stage(day_master: str, branch: str) -> str:
    """日主 ``day_master`` が地支 ``branch`` で受ける十二運星を返す。

    「長生」の位置は日干ごとに決まっており、陽干は十二支を順行、
    陰干は逆行して残りの11段階を並べる。
    """
    origin = EARTHLY_BRANCHES.index(STAGE_ORIGIN_BRANCH[day_master])
    step = 1 if STEM_YANG[day_master] else -1
    offset = (EARTHLY_BRANCHES.index(branch) - origin) * step
    return TWELVE_STAGES[offset % 12]
