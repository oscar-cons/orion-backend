"""cambia content de forum_posts a Text

Revision ID: d80c76b6dd8e
Revises: a033b356a0b6
Create Date: 2025-07-08 12:05:50.960868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd80c76b6dd8e'
down_revision: Union[str, Sequence[str], None] = 'a033b356a0b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('forum_posts', 'content', type_=sa.Text(), postgresql_using='content::text')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('forum_posts', 'content', type_=sa.JSON(), postgresql_using='content::json')
