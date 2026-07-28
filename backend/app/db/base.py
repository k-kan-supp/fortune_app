from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """全 ORM モデルの基底クラス。Alembic はこの metadata を参照する。"""
