<?php
// header.php
require_once 'auth.php';
requireLogin();

// Υπολογισμός ενεργής σελίδας
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCG Management</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        body { background-color: #f8f9fa; }
        .navbar-brand { font-weight: bold; font-size: 1.3rem; }
        .container-main { margin-top: 30px; margin-bottom: 50px; }
        .card { box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; border-radius: 10px; }
        .card-header { font-weight: bold; background-color: white; border-bottom: 1px solid #edf2f9; }
        .table-hover tbody tr:hover { background-color: #f1f5f9; cursor: pointer; }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
  <div class="container">
    <a class="navbar-brand" href="index.php"><i class="bi bi-controller"></i> TCG Manager</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
            <a class="nav-link <?= $current_page == 'index.php' ? 'active fw-bold' : '' ?>" href="index.php">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= strpos($current_page, 'player') !== false ? 'active fw-bold' : '' ?>" href="players.php">
                <i class="bi bi-people-fill"></i> Παίκτες
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= $current_page == 'settings.php' ? 'active fw-bold' : '' ?>" href="settings.php">
                <i class="bi bi-gear-fill"></i> Ρυθμίσεις
            </a>
        </li>
      </ul>
      <ul class="navbar-nav align-items-center">
        <li class="nav-item text-light me-3 d-none d-lg-block">
            <i class="bi bi-person-circle"></i> <?= htmlspecialchars($_SESSION['admin_username'] ?? '') ?>
        </li>
        <li class="nav-item">
            <a class="btn btn-sm btn-outline-light" href="logout.php"><i class="bi bi-box-arrow-right"></i> Αποσύνδεση</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<div class="container container-main">
