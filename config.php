<?php
/**
 * Database Configuration File (PostgreSQL)
 * 
 * Φρόντισε να αλλάξεις τα παρακάτω στοιχεία με αυτά που έχεις δημιουργήσει
 * για την PostgreSQL βάση σου.
 */

// Στοιχεία Σύνδεσης Βάσης Δεδομένων
define('DB_HOST', 'localhost');
define('DB_PORT', '5432'); // Προεπιλεγμένη θύρα PostgreSQL
define('DB_USER', 'your_postgres_user');
define('DB_PASS', 'your_secure_password');
define('DB_NAME', 'your_postgres_db');

try {
    // Δημιουργία Data Source Name (DSN) για PDO (pgsql)
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;

    // Επιλογές PDO
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    // Σύνδεση με τη βάση
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

}
catch (PDOException $e) {
    error_log($e->getMessage());
    die("Αποτυχία σύνδεσης στη βάση δεδομένων PostgreSQL. Παρακαλώ ελέγξτε το αρχείο config.php.");
}
?>
