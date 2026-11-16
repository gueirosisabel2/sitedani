<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_admin_role();

function user_index_by_id(array $users, string $identifier): ?int
{
    foreach ($users as $index => $user) {
        if (hash_equals((string) ($user['id'] ?? ''), $identifier)) {
            return $index;
        }
    }
    return null;
}

function active_admin_count(array $users): int
{
    return count(array_filter($users, static fn (array $user): bool =>
        ($user['role'] ?? '') === 'admin' && ($user['active'] ?? false) === true
    ));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');
    $currentId = (string) ($_SESSION['admin_id'] ?? '');
    $store = admin_store();
    $users = $store['users'];

    try {
        if ($action === 'create') {
            $username = strtolower(trim((string) ($_POST['username'] ?? '')));
            $role = (string) ($_POST['role'] ?? 'editor');
            $password = (string) ($_POST['password'] ?? '');
            $confirmation = (string) ($_POST['password_confirmation'] ?? '');

            if (count($users) >= 50) {
                throw new RuntimeException('O limite de 50 usuários foi atingido.');
            }
            if (strlen($username) > 254 || !filter_var($username, FILTER_VALIDATE_EMAIL)) {
                throw new RuntimeException('Informe um e-mail válido.');
            }
            if (!in_array($role, ['admin', 'editor'], true)) {
                throw new RuntimeException('Selecione uma permissão válida.');
            }
            if (admin_user_by_username($username) !== null) {
                throw new RuntimeException('Este e-mail já está cadastrado.');
            }
            if (!password_is_strong($password)) {
                throw new RuntimeException('A senha deve ter pelo menos 14 caracteres, com letras, número e símbolo.');
            }
            if (!hash_equals($password, $confirmation)) {
                throw new RuntimeException('A confirmação da senha não corresponde.');
            }

            $users[] = [
                'id' => 'admin-' . bin2hex(random_bytes(12)),
                'username' => $username,
                'password_hash' => password_hash($password, password_algorithm()),
                'role' => $role,
                'active' => true,
                'session_version' => 1,
                'created_at' => gmdate('c'),
                'created_by' => (string) $_SESSION['admin_username'],
            ];
            $store['users'] = $users;
            write_admin_store($store);
            audit_event('admin_created', $username, 'success');
            $_SESSION['success'] = 'Novo acesso criado com segurança.';
        } else {
            $targetId = (string) ($_POST['user_id'] ?? '');
            $index = user_index_by_id($users, $targetId);
            if ($index === null) {
                throw new RuntimeException('Usuário não encontrado.');
            }
            $target = $users[$index];
            $targetUsername = (string) ($target['username'] ?? 'unknown');

            if ($action === 'reset_password') {
                $password = (string) ($_POST['password'] ?? '');
                $confirmation = (string) ($_POST['password_confirmation'] ?? '');
                if (!password_is_strong($password)) {
                    throw new RuntimeException('A nova senha deve ter pelo menos 14 caracteres, com letras, número e símbolo.');
                }
                if (!hash_equals($password, $confirmation)) {
                    throw new RuntimeException('A confirmação da nova senha não corresponde.');
                }
                $users[$index]['password_hash'] = password_hash($password, password_algorithm());
                $users[$index]['session_version'] = (int) ($target['session_version'] ?? 1) + 1;
                $users[$index]['password_changed_at'] = gmdate('c');
                $store['users'] = $users;
                write_admin_store($store);
                audit_event('admin_password_reset', $targetUsername, 'success');
                $_SESSION['success'] = $targetId === $currentId
                    ? 'Senha alterada. Entre novamente com a nova senha.'
                    : 'Senha alterada e sessões antigas encerradas.';
            } elseif ($action === 'set_role') {
                $role = (string) ($_POST['role'] ?? '');
                if (!in_array($role, ['admin', 'editor'], true)) {
                    throw new RuntimeException('Permissão inválida.');
                }
                if ($targetId === $currentId && $role !== 'admin') {
                    throw new RuntimeException('Você não pode remover sua própria permissão administrativa.');
                }
                $users[$index]['role'] = $role;
                $store['users'] = $users;
                write_admin_store($store);
                audit_event('admin_role_changed', $targetUsername, 'success');
                $_SESSION['success'] = 'Permissão atualizada.';
            } elseif ($action === 'toggle_active') {
                if ($targetId === $currentId) {
                    throw new RuntimeException('Você não pode bloquear seu próprio acesso.');
                }
                $willActivate = !($target['active'] ?? false);
                if (!$willActivate && ($target['role'] ?? '') === 'admin' && active_admin_count($users) <= 1) {
                    throw new RuntimeException('O último administrador ativo não pode ser bloqueado.');
                }
                $users[$index]['active'] = $willActivate;
                if (!$willActivate) {
                    $users[$index]['session_version'] = (int) ($target['session_version'] ?? 1) + 1;
                }
                $store['users'] = $users;
                write_admin_store($store);
                audit_event($willActivate ? 'admin_enabled' : 'admin_disabled', $targetUsername, 'success');
                $_SESSION['success'] = $willActivate ? 'Acesso reativado.' : 'Acesso bloqueado e sessões encerradas.';
            } elseif ($action === 'delete') {
                if ($targetId === $currentId) {
                    throw new RuntimeException('Você não pode excluir seu próprio acesso.');
                }
                if (($_POST['confirm_delete'] ?? '') !== 'yes') {
                    throw new RuntimeException('Marque a confirmação antes de excluir.');
                }
                if (($target['active'] ?? false) && ($target['role'] ?? '') === 'admin' && active_admin_count($users) <= 1) {
                    throw new RuntimeException('O último administrador ativo não pode ser excluído.');
                }
                array_splice($users, $index, 1);
                $store['users'] = $users;
                write_admin_store($store);
                audit_event('admin_deleted', $targetUsername, 'success');
                $_SESSION['success'] = 'Acesso excluído.';
            } else {
                throw new RuntimeException('Ação inválida.');
            }
        }
    } catch (Throwable $exception) {
        audit_event('admin_management', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'failure');
        $_SESSION['error'] = $exception instanceof RuntimeException ? $exception->getMessage() : 'Não foi possível atualizar os usuários.';
    }
    redirect('users.php');
}

$users = admin_users();
$success = (string) ($_SESSION['success'] ?? '');
$error = (string) ($_SESSION['error'] ?? '');
unset($_SESSION['success'], $_SESSION['error']);
?>
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Administradores | Dani Alonso</title><link rel="stylesheet" href="assets/admin.css"></head>
<body><header class="admin-header"><a class="brand" href="index.php">DANI <span>ALONSO</span></a><div class="header-actions"><a href="index.php">Publicações</a><form method="post" action="logout.php"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><button class="link-button" type="submit">Sair</button></form></div></header>
<main class="admin-shell">
<section class="welcome"><div><p class="eyebrow">Segurança e equipe</p><h1>Administradores</h1><p class="muted">Cada pessoa deve usar seu próprio e-mail e senha. Administradores gerenciam acessos; editores apenas publicam.</p></div><div class="total"><strong><?= count($users) ?></strong><span>acessos cadastrados</span></div></section>
<?php if ($success): ?><div class="alert alert-success" role="status"><?= e($success) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-error" role="alert"><?= e($error) ?></div><?php endif; ?>

<section class="panel user-create"><h2>Cadastrar novo acesso</h2><form method="post" autocomplete="off">
<input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="create">
<div class="field-row"><label>E-mail<input type="email" name="username" required maxlength="254" autocomplete="off"></label><label>Permissão<select name="role" required><option value="editor">Editor — publica matérias</option><option value="admin">Administrador — gerencia tudo</option></select></label></div>
<div class="field-row"><label>Senha inicial<input type="password" name="password" required minlength="14" autocomplete="new-password"><small>Mínimo de 14 caracteres, com letras, número e símbolo.</small></label><label>Confirmar senha<input type="password" name="password_confirmation" required minlength="14" autocomplete="new-password"></label></div>
<button type="submit">Criar acesso</button>
</form></section>

<section class="users-list" aria-label="Usuários cadastrados">
<?php foreach ($users as $user): $isCurrent = ($user['id'] ?? '') === ($_SESSION['admin_id'] ?? ''); ?>
<article class="panel user-card<?= ($user['active'] ?? false) ? '' : ' is-disabled' ?>">
<div class="user-card-heading"><div><h2><?= e((string) ($user['username'] ?? '')) ?><?= $isCurrent ? ' <small>(você)</small>' : '' ?></h2><p class="muted">Criado em <?= e(date('d/m/Y', strtotime((string) ($user['created_at'] ?? 'now')))) ?><?= !empty($user['last_login_at']) ? ' · último acesso em ' . e(date('d/m/Y H:i', strtotime((string) $user['last_login_at']))) : '' ?></p></div><span class="status-badge <?= ($user['active'] ?? false) ? 'active' : 'blocked' ?>"><?= ($user['active'] ?? false) ? 'Ativo' : 'Bloqueado' ?></span></div>
<div class="user-actions">
<form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="set_role"><input type="hidden" name="user_id" value="<?= e((string) $user['id']) ?>"><label>Permissão<select name="role"><option value="editor" <?= ($user['role'] ?? '') === 'editor' ? 'selected' : '' ?>>Editor</option><option value="admin" <?= ($user['role'] ?? '') === 'admin' ? 'selected' : '' ?>>Administrador</option></select></label><button type="submit" <?= $isCurrent ? 'disabled title="Sua própria permissão não pode ser reduzida"' : '' ?>>Salvar permissão</button></form>
<form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="reset_password"><input type="hidden" name="user_id" value="<?= e((string) $user['id']) ?>"><label>Nova senha<input type="password" name="password" required minlength="14" autocomplete="new-password"></label><label>Confirmar<input type="password" name="password_confirmation" required minlength="14" autocomplete="new-password"></label><button type="submit">Alterar senha</button></form>
<?php if (!$isCurrent): ?><div class="danger-actions"><form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="toggle_active"><input type="hidden" name="user_id" value="<?= e((string) $user['id']) ?>"><button class="button-secondary" type="submit"><?= ($user['active'] ?? false) ? 'Bloquear acesso' : 'Reativar acesso' ?></button></form><form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="user_id" value="<?= e((string) $user['id']) ?>"><label class="confirm-check"><input type="checkbox" name="confirm_delete" value="yes" required>Confirmo a exclusão</label><button class="button-danger" type="submit">Excluir</button></form></div><?php endif; ?>
</div></article>
<?php endforeach; ?>
</section>
</main></body></html>
