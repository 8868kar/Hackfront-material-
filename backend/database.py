import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "neurosync.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            picture     TEXT    DEFAULT '',
            auth_method TEXT    DEFAULT 'manual',
            google_id   TEXT    DEFAULT '',
            role        TEXT    DEFAULT 'user',
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL,
            prediction      TEXT    NOT NULL,
            confidence      REAL    NOT NULL,
            severity        TEXT    NOT NULL,
            behavioral_scores TEXT  NOT NULL,
            analysis_details  TEXT  NOT NULL,
            iks_recommendations TEXT DEFAULT '{}',
            input_data      TEXT    DEFAULT '{}',
            created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id)
    """)

    # Create default admin user if not exists
    cur.execute("SELECT id FROM users WHERE email = ?", ("admin@neurosync.app",))
    if cur.fetchone() is None:
        cur.execute(
            "INSERT INTO users (name, email, auth_method, role) VALUES (?, ?, ?, ?)",
            ("Admin", "admin@neurosync.app", "manual", "admin"),
        )

    conn.commit()
    conn.close()


# ── User operations ──────────────────────────────────────────────────────

def upsert_user(name: str, email: str, picture: str = "", auth_method: str = "manual", google_id: str = "") -> dict:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cur.fetchone()

    if row:
        # Update existing user
        cur.execute(
            "UPDATE users SET name=?, picture=?, auth_method=?, google_id=? WHERE email=?",
            (name, picture or row["picture"], auth_method, google_id or row["google_id"], email),
        )
        conn.commit()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
    else:
        cur.execute(
            "INSERT INTO users (name, email, picture, auth_method, google_id) VALUES (?, ?, ?, ?, ?)",
            (name, email, picture, auth_method, google_id),
        )
        conn.commit()
        cur.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,))
        row = cur.fetchone()

    user = dict(row)
    conn.close()
    return user


def get_user_by_email(email: str) -> dict | None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_users() -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_count() -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM users WHERE role != 'admin'")
    row = cur.fetchone()
    conn.close()
    return row["cnt"]


# ── Assessment operations ────────────────────────────────────────────────

def save_assessment(user_id: int, prediction_result: dict, input_data: dict = None) -> dict:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO assessments
           (user_id, prediction, confidence, severity, behavioral_scores, analysis_details, iks_recommendations, input_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id,
            prediction_result.get("prediction", ""),
            prediction_result.get("confidence", 0),
            prediction_result.get("severity", ""),
            json.dumps(prediction_result.get("behavioral_scores", {})),
            json.dumps(prediction_result.get("analysis_details", {})),
            json.dumps(prediction_result.get("iks_recommendations", {})),
            json.dumps(input_data or {}),
        ),
    )
    conn.commit()
    assessment_id = cur.lastrowid
    cur.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    row = cur.fetchone()
    conn.close()
    return _parse_assessment(dict(row))


def get_assessments_by_user(user_id: int) -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [_parse_assessment(dict(r)) for r in rows]


def get_all_assessments() -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.*, u.name as user_name, u.email as user_email, u.picture as user_picture
        FROM assessments a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return [_parse_assessment(dict(r)) for r in rows]


def get_assessment_count() -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM assessments")
    row = cur.fetchone()
    conn.close()
    return row["cnt"]


def _parse_assessment(d: dict) -> dict:
    for key in ("behavioral_scores", "analysis_details", "iks_recommendations", "input_data"):
        if key in d and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                pass
    return d


# Initialize DB on import
init_db()
