<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_auth();
$posts = read_json(storage_path('posts.json'));
$recent = array_slice($posts, 0, 8);
$success = (string) ($_SESSION['success'] ?? '');
$error = (string) ($_SESSION['error'] ?? '');
unset($_SESSION['success'], $_SESSION['error']);
?>
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel de notícias | Dani Alonso</title><link rel="stylesheet" href="assets/admin.css"></head>
<body><header class="admin-header"><a class="brand" href="index.php">DANI <span>ALONSO</span></a><div class="header-actions"><?php if (($_SESSION['admin_role'] ?? '') === 'admin'): ?><a href="users.php">Administradores</a><?php endif; ?><a href="../noticias.html" target="_blank" rel="noopener">Ver notícias</a><form method="post" action="logout.php"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><button class="link-button" type="submit">Sair</button></form></div></header>
<main class="admin-shell">
<section class="welcome"><div><p class="eyebrow">Painel editorial</p><h1>Publicar nova matéria</h1><p class="muted">A matéria será adicionada imediatamente ao início da página de notícias.</p></div><div class="total"><strong><?= count($posts) ?></strong><span>matérias publicadas</span></div></section>
<?php if ($success): ?><div class="alert alert-success" role="status"><?= e($success) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-error" role="alert"><?= e($error) ?></div><?php endif; ?>
<div class="dashboard-grid"><section class="panel"><form method="post" action="publish.php" enctype="multipart/form-data">
<input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
<label>Título<input type="text" name="title" required maxlength="180"></label>
<div class="field-row"><label>Data de publicação<input type="date" name="date" required value="<?= date('Y-m-d') ?>"></label><label>Categoria<input type="text" value="Blog" disabled></label></div>
<label>Resumo<textarea name="summary" required maxlength="600" rows="4" placeholder="Apresentação curta que aparece no card."></textarea></label>
<label>Texto completo<textarea name="body" required rows="16" placeholder="Separe os parágrafos com uma linha em branco."></textarea></label>
<label>Imagem destacada<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"><small>JPG, PNG, WebP ou GIF, com até 8 MB. Use imagens horizontais em boa resolução.</small></label>
<button type="submit">Publicar matéria</button>
</form></section>
<aside class="panel recent"><h2>Publicações recentes</h2><?php foreach ($recent as $post): ?><article><time><?= e((string) ($post['data'] ?? '')) ?></time><h3><?= e((string) ($post['titulo'] ?? 'Sem título')) ?></h3></article><?php endforeach; ?></aside></div>
</main></body></html>
