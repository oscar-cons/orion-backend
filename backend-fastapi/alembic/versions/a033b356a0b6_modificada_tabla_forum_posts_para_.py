"""modificada tabla forum_posts para nuevos campos y tipos

Revision ID: a033b356a0b6
Revises: ee8985c9562c
Create Date: 2025-07-08 11:45:34.064957

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a033b356a0b6'
down_revision: Union[str, Sequence[str], None] = 'ee8985c9562c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Sobrescribe todos los valores de content con '{}' (JSON vacío)
    op.execute("UPDATE forum_posts SET content = '{}' ")
    # 2. Alterar tipo de columna content a JSON
    op.alter_column('forum_posts', 'content', type_=sa.JSON(), postgresql_using='content::json', existing_type=sa.String(), nullable=True)
    # 3. Agregar columnas nuevas como nullable=True
    op.add_column('forum_posts', sa.Column('author_username', sa.String(), nullable=True))
    op.add_column('forum_posts', sa.Column('category', sa.String(), nullable=True))
    op.add_column('forum_posts', sa.Column('comments', sa.JSON(), nullable=True))
    op.add_column('forum_posts', sa.Column('number_comments', sa.Integer(), nullable=True))
    op.add_column('forum_posts', sa.Column('date', sa.DateTime(timezone=True), nullable=True))
    # 4. Rellenar valores existentes con un valor por defecto
    op.execute("UPDATE forum_posts SET author_username = 'unknown' WHERE author_username IS NULL")
    op.execute("UPDATE forum_posts SET category = 'uncategorized' WHERE category IS NULL")
    op.execute("UPDATE forum_posts SET comments = '[]' WHERE comments IS NULL")
    op.execute("UPDATE forum_posts SET number_comments = 0 WHERE number_comments IS NULL")
    op.execute("UPDATE forum_posts SET date = NOW() WHERE date IS NULL")
    # 5. Alterar columnas para que sean NOT NULL
    op.alter_column('forum_posts', 'author_username', nullable=False)
    op.alter_column('forum_posts', 'content', nullable=False)
    op.alter_column('forum_posts', 'category', nullable=False)
    op.alter_column('forum_posts', 'comments', nullable=True)
    op.alter_column('forum_posts', 'number_comments', nullable=False)
    op.alter_column('forum_posts', 'date', nullable=False)
    # 6. Eliminar columnas antiguas (ignorando error si no existen)
    try:
        op.drop_column('forum_posts', 'image_path')
    except Exception:
        pass
    try:
        op.drop_column('forum_posts', 'created_at')
    except Exception:
        pass


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('forum_posts', sa.Column('image_path', sa.String(), nullable=True))
    op.add_column('forum_posts', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.drop_column('forum_posts', 'author_username')
    # Volver content a String
    op.alter_column('forum_posts', 'content', type_=sa.String(), postgresql_using='content::text', existing_type=sa.JSON(), nullable=True)
    op.drop_column('forum_posts', 'category')
    op.drop_column('forum_posts', 'comments')
    op.drop_column('forum_posts', 'number_comments')
    op.drop_column('forum_posts', 'date')
