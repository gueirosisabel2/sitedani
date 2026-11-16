<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (!has_admin_users()) {
    redirect('setup.php');
}
if (is_authenticated()) {
    redirect('index.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = strtolower(trim((string) ($_POST['username'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');

    if (login_is_limited($username)) {
        audit_event('login_rate_limited', $username, 'blocked');
        $error = 'Muitas tentativas. Aguarde 15 minutos e tente novamente.';
    } else {
        $admin = admin_user_by_username($username);
        $storedHash = is_array($admin) ? (string) ($admin['password_hash'] ?? '') : '$2y$12$k9Jj4rQAKnbLwKRzLXSy2e4bPXfIacPBzvNEDwIcvIrdc4Y6FCmD2';
        $validUser = is_array($admin) && ($admin['active'] ?? false) === true;
        $validPassword = password_verify($password, $storedHash);
        $valid = $validUser && $validPassword;
        if ($valid) {
            clear_login_failures($username);
            $store = admin_store();
            foreach ($store['users'] as &$storedUser) {
                if (($storedUser['id'] ?? '') === ($admin['id'] ?? '')) {
                    if (password_needs_rehash($storedHash, password_algorithm())) {
                        $storedUser['password_hash'] = password_hash($password, password_algorithm());
                    }
                    $storedUser['last_login_at'] = gmdate('c');
                    break;
                }
            }
            unset($storedUser);
            write_admin_store($store);
            session_regenerate_id(true);
            $_SESSION['admin_authenticated'] = true;
            $_SESSION['admin_id'] = (string) $admin['id'];
            $_SESSION['admin_username'] = $username;
            $_SESSION['admin_role'] = (string) ($admin['role'] ?? 'editor');
            $_SESSION['admin_session_version'] = (int) ($admin['session_version'] ?? 1);
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            $_SESSION['created_at'] = time();
            $_SESSION['last_activity'] = time();
            $_SESSION['last_renewal'] = time();
            audit_event('login', $username, 'success');
            redirect('index.php');
        }
        record_login_failure($username);
        audit_event('login', $username, 'failure');
        usleep(random_int(250000, 600000));
        $error = 'E-mail ou senha inválidos.';
    }
}
?>
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Entrar | Painel de notícias</title><link rel="stylesheet" href="assets/admin.css"></head>
<body class="auth-page"><main class="auth-card">
<div class="brand">DANI <span>ALONSO</span></div><p class="eyebrow">Painel editorial</p><h1>Entrar</h1><p class="muted">Acesso restrito à equipe autorizada.</p>
<?php if (isset($_GET['configured'])): ?><div class="alert alert-success">Acesso criado. Faça seu primeiro login.</div><?php endif; ?>
<?php if (isset($_GET['expired'])): ?><div class="alert">Sua sessão expirou por segurança. Entre novamente.</div><?php endif; ?>
<?php if (isset($_GET['disabled'])): ?><div class="alert">Este acesso não está mais disponível. Fale com um administrador.</div><?php endif; ?>
<?php if (isset($_GET['revoked'])): ?><div class="alert">Sua sessão foi encerrada após uma alteração de segurança. Entre novamente.</div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-error" role="alert"><?= e($error) ?></div><?php endif; ?>
<form method="post">
<input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
<label>E-mail<input type="email" name="username" required autocomplete="username" autofocus></label>
<label>Senha<input type="password" name="password" required autocomplete="current-password"></label>
<button type="submit">Entrar com segurança</button>
</form></main></body></html>
