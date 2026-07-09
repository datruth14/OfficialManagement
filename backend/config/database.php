<?php

define('DB_PATH', __DIR__ . '/../data/staff_management.db');

function getDb(): PDO {
    if (!extension_loaded('pdo_sqlite')) {
        throw new RuntimeException('SQLite PDO driver (pdo_sqlite) is not installed. Install it with: apt install php-sqlite3');
    }
    static $pdo = null;
    if ($pdo === null) {
        $dir = dirname(DB_PATH);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode=WAL');
        $pdo->exec('PRAGMA foreign_keys=ON');
    }
    return $pdo;
}

function initDatabase(): void {
    $db = getDb();
    $db->exec("
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            phone TEXT,
            password TEXT NOT NULL,
            department TEXT,
            status TEXT DEFAULT 'active',
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            staff_id TEXT UNIQUE,
            firstname TEXT NOT NULL,
            lastname TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            gender TEXT,
            status TEXT DEFAULT 'active',
            admin_id INTEGER REFERENCES admins(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            description TEXT,
            venue TEXT,
            event_date DATE,
            start_time TEXT,
            end_time TEXT,
            status TEXT DEFAULT 'active',
            admin_id INTEGER REFERENCES admins(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_name TEXT NOT NULL,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            admin_id INTEGER REFERENCES admins(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS staff_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
            role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
            UNIQUE(staff_id, role_id)
        );

        CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
            staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
            UNIQUE(team_id, staff_id)
        );
    ");
}

function seedDefaultAdmin(): void {
    $db = getDb();
    // Default super admin: admin / 123456789
    $stmt = $db->query("SELECT COUNT(*) as cnt FROM admins WHERE role = 'super_admin' AND username = 'admin'");
    $row = $stmt->fetch();
    if ((int)$row['cnt'] === 0) {
        $hash = password_hash('123456789', PASSWORD_BCRYPT);
        $db->prepare("INSERT INTO admins (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)")
           ->execute(['Super Admin', 'admin', 'admin@staffmgmt.com', $hash, 'super_admin']);
    }
    // Second super admin: superuser / 1234567890
    $stmt2 = $db->query("SELECT COUNT(*) as cnt FROM admins WHERE username = 'superuser'");
    $row2 = $stmt2->fetch();
    if ((int)$row2['cnt'] === 0) {
        $hash2 = password_hash('1234567890', PASSWORD_BCRYPT);
        $db->prepare("INSERT INTO admins (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)")
            ->execute(['Super User', 'superuser', 'superuser@staffmgmt.com', $hash2, 'super_user']);
    }
}
