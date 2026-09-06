"""Add user role

Revision ID: 7d14435810c8
Revises: 66843a7465f0
Create Date: 2026-09-05 02:19:26.433674

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d14435810c8'
down_revision: Union[str, Sequence[str], None] = '66843a7465f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'users',
        sa.Column('role', sa.String(), nullable=True)
    )

    op.execute(
        "UPDATE users SET role = 'User' WHERE role IS NULL"
    )

    op.alter_column(
        'users',
        'role',
        existing_type=sa.String(),
        nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
