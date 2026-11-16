<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (has_admin_users()) {
    redirect('login.php');
}

$error = '';
$configuredKey = cms_config()['setup_key'];
$configurationReady = $configuredKey !== '' && !str_starts_with($configuredKey, 'TROQUE-');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $setupKey = (string) ($_POST['setup_key'] ?? '');
    $username = strtolower(trim((string) ($_POST['username'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');
    $confirmation = (string) ($_POST['password_confirmation'] ?? '');

    if (login_is_limited('__setup__')) {
        audit_event('setup_rate_limited', '__setup__', 'blocked');
        $error = 'Muitas tentativas. Aguarde 15 minutos e tente novamente.';
    } elseif (!$configurationReady || !hash_equals($configuredKey, $setupKey)) {
        record_login_failure('__setup__');
        audit_event('setup_key', '__setup__', 'failure');
        usleep(random_int(250000, 600000));
        $error = 'Chave de instalação inválida.';
    } elseif (!filter_var($username, FILTER_VALIDATE_EMAIL)) {
        $error = 'Informe um e-mail válido para o administrador.';
    } elseif (!password_is_strong($password)) {
        $error = 'A senha deve ter pelo menos 14 caracteres, com letras, número e símbolo.';
    } elseif (!hash_equals($password, $confirmation)) {
        $error = 'A confirmação da senha não corresponde.';
    } else {
        write_admin_store([
            'version' => 2,
            'users' => [[
                'id' => 'admin-' . bin2hex(random_bytes(12)),
                'username' => $username,
                'password_hash' => password_hash($password, password_algorithm()),
                'role' => 'admin',
                'active' => true,
                'session_version' => 1,
                'created_at' => gmdate('c'),
                'created_by' => 'initial-setup',
            ]],
        ]);
        clear_login_failures('__setup__');
        audit_event('setup', $username, 'success');
        redirect('login.php?configured=1');
    }
}
?>
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Configurar painel | Dani Alonso</title><link rel="stylesheet" href="assets/admin.css"></head>
<body class="auth-page"><main class="auth-card">
<div class="brand">DANI <span>ALONSO</span></div><p class="eyebrow">Configuração segura</p><h1>Criar acesso administrativo</h1>
<?php if (!$configurationReady): ?><div class="alert">Configure primeiro <code>DANI_CMS_SETUP_KEY</code> no servidor ou crie <code>config.local.php</code> a partir do exemplo.</div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>
<form method="post" autocomplete="off">
<input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
<label>Chave de instalação<input type="password" name="setup_key" required autocomplete="off"></label>
<label>E-mail do administrador<input type="email" name="username" required autocomplete="username"></label>
<label>Senha segura<input type="password" name="password" required minlength="14" autocomplete="new-password"><small>Mínimo de 14 caracteres, com letras, número e símbolo.</small></label>
<label>Confirmar senha<input type="password" name="password_confirmation" required minlength="14" autocomplete="new-password"></label>
<button type="submit" <?= $configurationReady ? '' : 'disabled' ?>>Criar acesso</button>
</form></main></body></html>
