<?php
declare(strict_types=1);

const CMS_ROOT = __DIR__ . '/..';

function cms_config(): array
{
    static $config;
    if (is_array($config)) {
        return $config;
    }

    $local = [];
    $localFile = __DIR__ . '/config.local.php';
    if (is_file($localFile)) {
        $loaded = require $localFile;
        if (is_array($loaded)) {
            $local = $loaded;
        }
    }

    $storage = getenv('DANI_CMS_STORAGE_PATH') ?: ($local['storage_path'] ?? dirname(CMS_ROOT) . '/dani-cms-private');
    $setupKey = getenv('DANI_CMS_SETUP_KEY') ?: ($local['setup_key'] ?? '');
    $allowedIps = getenv('DANI_CMS_ALLOWED_IPS') ?: ($local['allowed_ips'] ?? '');
    $config = [
        'storage_path' => rtrim((string) $storage, '/\\'),
        'setup_key' => (string) $setupKey,
        'allowed_ips' => is_array($allowedIps)
            ? array_values(array_filter(array_map('trim', $allowedIps)))
            : array_values(array_filter(array_map('trim', explode(',', (string) $allowedIps)))),
    ];
    return $config;
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function is_local_request(): bool
{
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $host = preg_replace('/:\d+$/', '', $host) ?: $host;
    return in_array($host, ['localhost', '127.0.0.1', '[::1]', '::1'], true);
}

function enforce_admin_transport_and_network(): void
{
    if (!is_https() && !is_local_request()) {
        http_response_code(400);
        header('Content-Type: text/plain; charset=UTF-8');
        exit('O painel administrativo exige uma conexão HTTPS segura.');
    }

    $allowedIps = cms_config()['allowed_ips'];
    $remoteIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if ($allowedIps !== [] && !in_array($remoteIp, $allowedIps, true)) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=UTF-8');
        exit('Acesso ao painel não autorizado nesta rede.');
    }
}

function security_headers(): void
{
    header_remove('X-Powered-By');
    header('Cache-Control: no-store, private, max-age=0');
    header('Pragma: no-cache');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
}

security_headers();
enforce_admin_transport_and_network();
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_trans_sid', '0');
ini_set('session.sid_length', '64');
ini_set('session.sid_bits_per_character', '6');
session_name(is_https() ? '__Host-dani_cms' : 'dani_cms_local');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => is_https() ? '/' : '/admin',
    'secure' => is_https(),
    'httponly' => true,
    'samesite' => 'Strict',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function storage_path(string $file = ''): string
{
    $base = cms_config()['storage_path'];
    if (!is_dir($base) && !mkdir($base, 0700, true) && !is_dir($base)) {
        throw new RuntimeException('Não foi possível criar a pasta privada do CMS.');
    }
    return $file === '' ? $base : $base . DIRECTORY_SEPARATOR . $file;
}

function initialize_posts(): void
{
    $destination = storage_path('posts.json');
    if (is_file($destination)) {
        return;
    }
    $seed = __DIR__ . '/seed/posts.json';
    if (!is_file($seed) || !copy($seed, $destination)) {
        throw new RuntimeException('Não foi possível inicializar a base de matérias.');
    }
    chmod($destination, 0600);
}

function read_json(string $path, array $fallback = []): array
{
    if (!is_file($path)) {
        return $fallback;
    }
    $content = file_get_contents($path);
    if ($content === false) {
        throw new RuntimeException('Falha ao ler dados privados.');
    }
    $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    return is_array($decoded) ? $decoded : $fallback;
}

function atomic_write(string $path, string $content, int $permissions = 0600): void
{
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Não foi possível criar a pasta de destino.');
    }
    $temporary = tempnam($directory, '.cms-');
    if ($temporary === false || file_put_contents($temporary, $content, LOCK_EX) === false) {
        throw new RuntimeException('Não foi possível salvar os dados.');
    }
    chmod($temporary, $permissions);
    if (DIRECTORY_SEPARATOR === '\\' && is_file($path) && !unlink($path)) {
        @unlink($temporary);
        throw new RuntimeException('Não foi possível substituir os dados existentes.');
    }
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Não foi possível finalizar a gravação dos dados.');
    }
}

function write_json(string $path, array $data, int $permissions = 0600): void
{
    atomic_write($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR), $permissions);
}

function password_algorithm(): string|int
{
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
}

function password_is_strong(string $password): bool
{
    return strlen($password) >= 14
        && preg_match('/[A-Za-z]/', $password) === 1
        && preg_match('/\d/', $password) === 1
        && preg_match('/[^A-Za-z0-9]/', $password) === 1;
}

function admin_store(): array
{
    $path = storage_path('admin.json');
    if (!is_file($path)) {
        return ['version' => 2, 'users' => []];
    }

    $stored = read_json($path);
    if (isset($stored['username'], $stored['password_hash'])) {
        $legacyUsername = strtolower(trim((string) $stored['username']));
        $stored = [
            'version' => 2,
            'users' => [[
                'id' => 'admin-' . bin2hex(random_bytes(12)),
                'username' => $legacyUsername,
                'password_hash' => (string) $stored['password_hash'],
                'role' => 'admin',
                'active' => true,
                'session_version' => 1,
                'created_at' => (string) ($stored['created_at'] ?? gmdate('c')),
                'created_by' => 'legacy-migration',
            ]],
        ];
        write_json($path, $stored);
        audit_event('admin_store_migrated', $legacyUsername, 'success');
    }

    if (!isset($stored['users']) || !is_array($stored['users'])) {
        return ['version' => 2, 'users' => []];
    }
    return ['version' => 2, 'users' => array_values(array_filter($stored['users'], 'is_array'))];
}

function write_admin_store(array $store): void
{
    $store['version'] = 2;
    $store['users'] = array_values((array) ($store['users'] ?? []));
    write_json(storage_path('admin.json'), $store);
}

function admin_users(): array
{
    return admin_store()['users'];
}

function has_admin_users(): bool
{
    return admin_users() !== [];
}

function admin_user_by_username(string $username): ?array
{
    $normalized = strtolower(trim($username));
    foreach (admin_users() as $user) {
        if (hash_equals((string) ($user['username'] ?? ''), $normalized)) {
            return $user;
        }
    }
    return null;
}

function admin_user_by_id(string $identifier): ?array
{
    foreach (admin_users() as $user) {
        if (hash_equals((string) ($user['id'] ?? ''), $identifier)) {
            return $user;
        }
    }
    return null;
}

function current_admin(): ?array
{
    $identifier = (string) ($_SESSION['admin_id'] ?? '');
    if ($identifier !== '') {
        return admin_user_by_id($identifier);
    }
    $username = (string) ($_SESSION['admin_username'] ?? '');
    return $username !== '' ? admin_user_by_username($username) : null;
}

function is_authenticated(): bool
{
    return !empty($_SESSION['admin_authenticated']) && !empty($_SESSION['admin_username']);
}

function require_auth(): void
{
    if (!is_authenticated()) {
        redirect('login.php');
    }
    enforce_session_lifetime();
    $admin = current_admin();
    if ($admin === null || !($admin['active'] ?? false)) {
        audit_event('session_account_unavailable', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'blocked');
        $_SESSION = [];
        session_regenerate_id(true);
        redirect('login.php?disabled=1');
    }
    $accountSessionVersion = (int) ($admin['session_version'] ?? 1);
    $sessionVersion = (int) ($_SESSION['admin_session_version'] ?? $accountSessionVersion);
    if ($sessionVersion !== $accountSessionVersion) {
        audit_event('session_revoked', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'blocked');
        $_SESSION = [];
        session_regenerate_id(true);
        redirect('login.php?revoked=1');
    }
    $_SESSION['admin_id'] = (string) $admin['id'];
    $_SESSION['admin_username'] = (string) $admin['username'];
    $_SESSION['admin_role'] = (string) ($admin['role'] ?? 'editor');
    $_SESSION['admin_session_version'] = $accountSessionVersion;
}

function require_admin_role(): void
{
    require_auth();
    if (($_SESSION['admin_role'] ?? '') !== 'admin') {
        audit_event('admin_area', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'blocked');
        http_response_code(403);
        exit('Você não possui permissão para administrar usuários.');
    }
}

function enforce_session_lifetime(): void
{
    $now = time();
    $created = (int) ($_SESSION['created_at'] ?? 0);
    $lastActivity = (int) ($_SESSION['last_activity'] ?? 0);
    $lastRenewal = (int) ($_SESSION['last_renewal'] ?? 0);

    if ($created === 0 || $lastActivity === 0 || ($now - $lastActivity) > 1200 || ($now - $created) > 28800) {
        audit_event('session_expired', (string) ($_SESSION['admin_username'] ?? 'unknown'), 'blocked');
        $_SESSION = [];
        session_regenerate_id(true);
        redirect('login.php?expired=1');
    }

    if (($now - $lastRenewal) > 900) {
        session_regenerate_id(true);
        $_SESSION['last_renewal'] = $now;
    }
    $_SESSION['last_activity'] = $now;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $provided = (string) ($_POST['csrf_token'] ?? '');
    if ($provided === '' || !hash_equals(csrf_token(), $provided)) {
        http_response_code(403);
        exit('Solicitação inválida. Atualize a página e tente novamente.');
    }
}

function redirect(string $location): never
{
    header('Location: ' . $location, true, 303);
    exit;
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function audit_event(string $event, string $username, string $result): void
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $session = session_id();
    $record = [
        'time' => gmdate('c'),
        'event' => preg_replace('/[^a-z0-9_-]/i', '', $event),
        'result' => preg_replace('/[^a-z0-9_-]/i', '', $result),
        'account' => hash('sha256', strtolower(trim($username))),
        'source' => hash('sha256', $ip),
        'session' => $session !== '' ? hash('sha256', $session) : '',
    ];
    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL;
    file_put_contents(storage_path('security.log'), $line, FILE_APPEND | LOCK_EX);
    @chmod(storage_path('security.log'), 0600);
}

function public_posts(array $posts): array
{
    return array_map(static function (array $post): array {
        $id = (string) ($post['id'] ?? '');
        return [
            'id' => $id,
            'titulo' => (string) ($post['titulo'] ?? ''),
            'data' => (string) ($post['data'] ?? ''),
            'dataIso' => (string) ($post['dataIso'] ?? ''),
            'imagem' => (string) ($post['imagem'] ?? ''),
            'imagemAlt' => (string) ($post['imagemAlt'] ?? ''),
            'categoria' => (string) ($post['categoria'] ?? 'Blog'),
            'resumo' => (string) ($post['resumo'] ?? ''),
            'contentUrl' => 'assets/data/noticias/' . rawurlencode($id) . '.json',
        ];
    }, $posts);
}

function client_key(string $username): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    return hash('sha256', strtolower(trim($username)) . '|' . $ip);
}

function login_is_limited(string $username): bool
{
    $attempts = read_json(storage_path('login-attempts.json'));
    $record = $attempts[client_key($username)] ?? null;
    if (!is_array($record)) {
        return false;
    }
    $windowStart = time() - 900;
    $times = array_values(array_filter($record, static fn ($timestamp) => (int) $timestamp >= $windowStart));
    return count($times) >= 5;
}

function record_login_failure(string $username): void
{
    $path = storage_path('login-attempts.json');
    $attempts = read_json($path);
    $key = client_key($username);
    $windowStart = time() - 900;
    $times = array_values(array_filter((array) ($attempts[$key] ?? []), static fn ($timestamp) => (int) $timestamp >= $windowStart));
    $times[] = time();
    $attempts[$key] = $times;
    write_json($path, $attempts);
}

function clear_login_failures(string $username): void
{
    $path = storage_path('login-attempts.json');
    $attempts = read_json($path);
    unset($attempts[client_key($username)]);
    write_json($path, $attempts);
}

function slugify(string $value): string
{
    $transliterated = function_exists('transliterator_transliterate')
        ? transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $value)
        : strtolower($value);
    $slug = preg_replace('/[^a-z0-9]+/i', '-', (string) $transliterated);
    return trim((string) $slug, '-') ?: 'materia';
}

function article_html(string $body): string
{
    $body = trim(str_replace(["\r\n", "\r"], "\n", $body));
    $paragraphs = preg_split('/\n{2,}/', $body) ?: [];
    return implode("\n", array_map(static function (string $paragraph): string {
        return '<p>' . nl2br(e(trim($paragraph)), false) . '</p>';
    }, array_filter($paragraphs, static fn (string $paragraph): bool => trim($paragraph) !== '')));
}

initialize_posts();
