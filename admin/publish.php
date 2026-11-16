<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php');
}
verify_csrf();

try {
    $title = trim((string) ($_POST['title'] ?? ''));
    $dateInput = (string) ($_POST['date'] ?? '');
    $summary = trim((string) ($_POST['summary'] ?? ''));
    $body = trim((string) ($_POST['body'] ?? ''));

    if ($title === '' || mb_strlen($title) > 180 || $summary === '' || mb_strlen($summary) > 600 || $body === '') {
        throw new RuntimeException('Revise os campos obrigatórios e seus limites.');
    }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $dateInput);
    if (!$date || $date->format('Y-m-d') !== $dateInput) {
        throw new RuntimeException('Data de publicação inválida.');
    }

    $imagePath = '';
    $imageAlt = $title;
    $upload = $_FILES['image'] ?? null;
    if (is_array($upload) && ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        if (($upload['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK || ($upload['size'] ?? 0) > 8 * 1024 * 1024) {
            throw new RuntimeException('A imagem não pôde ser enviada ou excede 8 MB.');
        }
        $temporary = (string) $upload['tmp_name'];
        if (!is_uploaded_file($temporary)) {
            throw new RuntimeException('O arquivo enviado não passou pela validação de upload.');
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temporary);
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $dimensions = @getimagesize($temporary);
        if (!isset($extensions[$mime]) || $dimensions === false) {
            throw new RuntimeException('Envie uma imagem JPG, PNG, WebP ou GIF válida.');
        }
        $width = (int) ($dimensions[0] ?? 0);
        $height = (int) ($dimensions[1] ?? 0);
        if ($width < 1 || $height < 1 || $width > 10000 || $height > 10000 || ($width * $height) > 40000000) {
            throw new RuntimeException('A imagem excede o limite seguro de dimensões.');
        }
        $relativeDirectory = 'uploads/blog/' . $date->format('Y/m');
        $absoluteDirectory = CMS_ROOT . '/' . $relativeDirectory;
        if (!is_dir($absoluteDirectory) && !mkdir($absoluteDirectory, 0755, true) && !is_dir($absoluteDirectory)) {
            throw new RuntimeException('Não foi possível criar a pasta de imagens.');
        }
        $fileName = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
        if (!move_uploaded_file($temporary, $absoluteDirectory . '/' . $fileName)) {
            throw new RuntimeException('Não foi possível salvar a imagem enviada.');
        }
        $imagePath = $relativeDirectory . '/' . $fileName;
    }

    $postsPath = storage_path('posts.json');
    $posts = read_json($postsPath);
    $identifier = 'post-cms-' . bin2hex(random_bytes(8));
    $slug = slugify($title) . '-' . $date->format('Ymd');
    $post = [
        'id' => $identifier,
        'wordpressId' => 0,
        'slug' => $slug,
        'titulo' => $title,
        'data' => $date->format('d/m/Y'),
        'dataIso' => $date->format('Y-m-d') . 'T12:00:00',
        'dataModificacaoIso' => gmdate('Y-m-d\TH:i:s'),
        'imagem' => $imagePath,
        'imagemOriginal' => '',
        'imagemAlt' => $imageAlt,
        'categoria' => 'Blog',
        'categorias' => ['Blog'],
        'resumo' => $summary,
        'conteudo' => article_html($body),
        'urlOriginal' => '',
        'status' => 'publish',
        'publishedBy' => (string) $_SESSION['admin_username'],
    ];
    array_unshift($posts, $post);
    usort($posts, static fn (array $a, array $b): int => strcmp((string) $b['dataIso'], (string) $a['dataIso']));

    $articleDirectory = CMS_ROOT . '/assets/data/noticias';
    $articleJson = json_encode(['id' => $identifier, 'conteudo' => $post['conteudo']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    atomic_write($articleDirectory . '/' . $identifier . '.json', $articleJson, 0644);

    $publicJson = json_encode(public_posts($posts), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    atomic_write(CMS_ROOT . '/assets/js/noticias-data.js', 'window.NOTICIAS_DATA = ' . $publicJson . ';' . PHP_EOL, 0644);
    write_json($postsPath, $posts);

    audit_event('publish', (string) $_SESSION['admin_username'], 'success');
    $_SESSION['success'] = 'Matéria publicada com sucesso.';
} catch (Throwable $exception) {
    audit_event('publish', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'failure');
    $_SESSION['error'] = $exception instanceof RuntimeException ? $exception->getMessage() : 'Não foi possível publicar a matéria.';
}
redirect('index.php');
