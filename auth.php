<?php
session_start();

/**
 * Ελέγχει αν ο χρήστης είναι συνδεδεμένος.
 */
function isLoggedIn()
{
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

/**
 * Ανακατευθύνει στο login αν ο χρήστης δεν είναι συνδεδεμένος.
 */
function requireLogin()
{
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}
?>
