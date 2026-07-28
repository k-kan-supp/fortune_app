from app.services.storage.base import FileStorage
from app.services.storage.local import LocalFileStorage


def get_file_storage() -> FileStorage:
    """設定に応じたストレージバックエンドを返す。

    本番で S3/GCS を使う場合は、ここに分岐を追加するだけで呼び出し側は変更不要。
    """
    # if settings.storage_backend == "s3":
    #     return S3FileStorage(...)
    return LocalFileStorage()
