# Publicação segura e rápida

Nenhum site é invulnerável. Este pacote aplica controles no código, mas a proteção final também depende da hospedagem, do TLS, das atualizações do servidor e da segurança da conta usada para publicar arquivos.

## Requisitos

- PHP 8.1 ou superior, atualizado, com `json`, `fileinfo` e `mbstring`.
- HTTPS com certificado válido e renovação automática.
- Apache 2.4 com `mod_headers`, `mod_rewrite`, `mod_expires`, `mod_deflate` e, quando disponível, `mod_brotli`.
- Se a hospedagem usa Nginx, LiteSpeed com regras próprias ou outro proxy, replique no servidor as regras do `.htaccess`; Nginx não lê esse arquivo.

## Configuração do painel

1. Defina `DANI_CMS_SETUP_KEY` com uma sequência aleatória de pelo menos 32 caracteres. Em hospedagem sem variáveis de ambiente, copie `admin/config.local.example.php` para `admin/config.local.php` e edite a cópia.
2. Defina `DANI_CMS_STORAGE_PATH` para uma pasta gravável fora da raiz pública. Não guarde `admin.json`, `posts.json`, logs ou bloqueios de login dentro do site.
3. Garanta permissão de gravação apenas para o usuário do PHP em `assets/js/noticias-data.js`, `assets/data/noticias/`, `uploads/blog/` e na pasta privada.
4. Abra `/admin/setup.php` uma única vez, crie uma senha exclusiva com 14 ou mais caracteres e depois remova a chave de configuração.
5. Opcionalmente, restrinja o painel a IPs fixos com `DANI_CMS_ALLOWED_IPS=203.0.113.10,198.51.100.20` ou com `allowed_ips` no arquivo local.
6. Não use o painel em HTTP fora do localhost. O próprio código rejeita esse acesso.

## Usuários e permissões

- Entre como administrador e abra **Administradores** no cabeçalho do painel.
- Cadastre um e-mail individual para cada integrante da equipe; nunca compartilhe contas.
- Use **Editor** para quem apenas publica matérias e **Administrador** somente para quem precisa gerenciar acessos.
- Ao alterar uma senha ou bloquear uma conta, as sessões antigas daquele usuário são revogadas.
- A conta administrativa atual é migrada automaticamente na primeira abertura do painel atualizado.

## Operação contínua

- Ative autenticação em dois fatores na hospedagem, no painel de DNS/CDN e na conta de e-mail de recuperação.
- Mantenha PHP, servidor web e painel da hospedagem atualizados.
- Faça backup diário dos arquivos públicos e da pasta privada, mantenha uma cópia externa e teste a restauração.
- Monitore o `audit.log` na pasta privada e alertas da hospedagem. O log usa identificadores resumidos e não grava senhas.
- Se usar CDN/WAF, mantenha TLS estrito até a origem, proteção contra bots e limitação de requisições para `/admin/`.
- Revise usuários e senhas após mudanças na equipe e nunca reutilize a senha administrativa.

## Cache e imagens

- Imagens e fontes recebem cache longo e `no-transform`, evitando alteração de qualidade por esta configuração.
- CSS e JavaScript recebem cache curto com revalidação; o índice de notícias e páginas administrativas não ficam presos em cache.
- Brotli/Gzip atua apenas em conteúdo textual. Imagens não são recomprimidas pelo pacote.
- Para melhor velocidade global sem sacrificar qualidade, uma CDN pode entregar os arquivos originais em pontos de presença próximos, com transformação de imagem desativada.

## Verificação após publicar

- Confirme que `http://` redireciona para `https://` e que `/admin/` não abre sem HTTPS.
- Confirme que `admin/config.local.php`, a pasta privada e arquivos de backup não são acessíveis pela web.
- Publique uma matéria de teste, abra-a no blog e valide imagem, acentos e conteúdo.
- Verifique os cabeçalhos CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` no domínio real.
- Execute uma varredura externa autorizada e um teste de restauração antes do lançamento.
