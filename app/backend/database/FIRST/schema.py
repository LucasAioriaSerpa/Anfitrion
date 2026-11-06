"""Read-only SQLite schema introspection used by the Database First generator."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Column:
    name: str
    sqlite_type: str
    python_type: str
    nullable: bool
    primary_key: bool
    default: Any = None
    generated: bool = False


@dataclass(frozen=True)
class ForeignKey:
    column: str
    references_table: str
    references_column: str


@dataclass
class Table:
    name: str
    class_name: str
    primary_key: str | None
    columns: list[Column] = field(default_factory=list)
    foreign_keys: list[ForeignKey] = field(default_factory=list)
    generated_resource: bool = True


def _python_type(sqlite_type: str) -> str:
    normalized = (sqlite_type or "").upper()
    if "INT" in normalized:
        return "int"
    if any(token in normalized for token in ("REAL", "FLOA", "DOUB", "NUM")):
        return "float"
    if "BOOL" in normalized:
        return "bool"
    return "str"


def _class_name(table_name: str) -> str:
    return "".join(part.capitalize() for part in table_name.split("_"))


def introspect_database(database_path: str | Path) -> dict[str, Any]:
    """Return a JSON-serializable description without modifying the database."""
    path = Path(database_path)
    if not path.is_file():
        raise FileNotFoundError(f"SQLite database not found: {path}")

    with sqlite3.connect(path) as connection:
        connection.row_factory = sqlite3.Row
        names = [
            row["name"]
            for row in connection.execute(
                "SELECT name FROM sqlite_master "
                "WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
        ]
        tables: list[Table] = []
        for name in names:
            columns = [
                Column(
                    name=row["name"],
                    sqlite_type=row["type"] or "TEXT",
                    python_type=_python_type(row["type"]),
                    nullable=not bool(row["notnull"]),
                    primary_key=bool(row["pk"]),
                    default=row["dflt_value"],
                    generated=bool(row["pk"]) or row["name"].lower() in {"criado_em", "senha"},
                )
                for row in connection.execute(f'PRAGMA table_info("{name}")')
            ]
            foreign_keys = [
                ForeignKey(
                    column=row["from"],
                    references_table=row["table"],
                    references_column=row["to"],
                )
                for row in connection.execute(f'PRAGMA foreign_key_list("{name}")')
            ]
            primary_key = next((column.name for column in columns if column.primary_key), None)
            tables.append(
                Table(
                    name=name,
                    class_name=_class_name(name),
                    primary_key=primary_key,
                    columns=columns,
                    foreign_keys=foreign_keys,
                )
            )

    return {
        "format_version": 1,
        "source": path.name,
        "tables": [asdict(table) for table in tables],
    }


def write_schema(database_path: str | Path, output_path: str | Path) -> dict[str, Any]:
    schema = introspect_database(database_path)
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return schema
