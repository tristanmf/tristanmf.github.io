<?php
// Complorama — recherche dans les transcriptions.
//
// Une seule page, appelée par le mur (tristan.pro/complorama/). Elle lit une
// base SQLite en lecture seule et ne renvoie que de courts extraits autour
// des mots trouvés : jamais la transcription entière, jamais un épisode
// complet. C'est ce qui distingue « citer trois lignes » de « republier une
// production Radio France ».
//
//   GET ?q=trump qanon      recherche (les mots sont combinés en ET)
//   GET ?q="chemin de fer"  expression exacte entre guillemets
//   GET ?q=…&ep=42          restreint à un épisode
//   GET ?q=…&page=2         page suivante
//   GET ?stats=1            état de l'index, sans rien exposer du contenu
//
// La base vit dans ../data/, hors racine web : elle n'est pas téléchargeable
// même en devinant son adresse. Déployé par SFTP depuis GitHub Actions.

declare(strict_types=1);

const DB_PATH      = __DIR__ . '/../data/index.sqlite';
const PER_PAGE     = 20;
const MAX_PAGE     = 25;      // 500 résultats au maximum, au-delà on affine
const SNIPPET_WORDS = 14;
const ALLOWED_ORIGINS = ['https://tristan.pro', 'https://www.tristan.pro', 'https://complorama.fr', 'https://www.complorama.fr'];

// ---------------------------------------------------------------- en-têtes
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=600');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') { fail(405, 'méthode non autorisée'); }

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function db(): PDO {
    if (!is_readable(DB_PATH)) fail(503, "index de recherche indisponible");
    $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA query_only = 1');
    return $pdo;
}

/**
 * Traduit ce que tape un visiteur en requête FTS5 sûre.
 *
 * Le texte brut ne peut pas être passé tel quel à MATCH : un guillemet ou un
 * caractère comme ^ * : - y a une signification et une saisie maladroite
 * provoquerait une erreur SQL. On extrait donc les expressions entre
 * guillemets, puis les mots, et on reconstruit une requête dont on maîtrise
 * la syntaxe. Les mots d'au moins quatre lettres reçoivent un * final :
 * « complot » trouve alors complotisme et complotiste, ce qui compte en
 * français où le pluriel et les dérivés sont partout.
 */
function buildMatch(string $raw): ?string {
    $parts = [];
    // 1. expressions exactes entre guillemets
    if (preg_match_all('/"([^"]{2,80})"/u', $raw, $m)) {
        foreach ($m[1] as $phrase) {
            $words = preg_split('/[^\p{L}\p{N}\']+/u', $phrase, -1, PREG_SPLIT_NO_EMPTY);
            if ($words) $parts[] = '"' . implode(' ', $words) . '"';
        }
        $raw = preg_replace('/"[^"]{2,80}"/u', ' ', $raw);
    }
    // 2. mots isolés
    $words = preg_split('/[^\p{L}\p{N}\']+/u', (string) $raw, -1, PREG_SPLIT_NO_EMPTY);
    foreach (array_slice($words, 0, 12) as $w) {
        if (mb_strlen($w) < 2) continue;
        $parts[] = mb_strlen($w) >= 4 ? '"' . $w . '"*' : '"' . $w . '"';
    }
    return $parts ? implode(' AND ', $parts) : null;
}

/** Secondes → 12:34 (ou 1:02:03). */
function timecode(float $s): string {
    $s = max(0, (int) round($s));
    $h = intdiv($s, 3600); $m = intdiv($s % 3600, 60); $sec = $s % 60;
    return $h ? sprintf('%d:%02d:%02d', $h, $m, $sec) : sprintf('%d:%02d', $m, $sec);
}

/** Identifiant YouTube d'une URL de vidéo, ou null. */
function youtubeId(?string $url): ?string {
    if (!$url) return null;
    if (preg_match('~(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})~', $url, $m)) return $m[1];
    return null;
}

// ------------------------------------------------------------------ stats
if (isset($_GET['stats'])) {
    $pdo = db();
    $build = [];
    foreach ($pdo->query('SELECT key, value FROM build') as $r) $build[$r['key']] = $r['value'];
    $build['episodes'] = (int) $pdo->query('SELECT count(*) FROM episodes')->fetchColumn();
    $build['episodes_avec_video'] = (int) $pdo->query('SELECT count(DISTINCT ep) FROM video_map')->fetchColumn();
    echo json_encode($build, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --------------------------------------------------------------- recherche
$q = trim((string) ($_GET['q'] ?? ''));
if ($q === '') fail(400, 'paramètre q manquant');
if (mb_strlen($q) > 200) fail(400, 'requête trop longue');

$match = buildMatch($q);
if ($match === null) fail(400, 'aucun mot exploitable dans la requête');

$page = max(1, min(MAX_PAGE, (int) ($_GET['page'] ?? 1)));
$ep   = isset($_GET['ep']) ? (int) $_GET['ep'] : null;

$pdo = db();
$where = 'passages_fts MATCH :m';
$args  = [':m' => $match];
if ($ep !== null) { $where .= ' AND p.ep = :ep'; $args[':ep'] = $ep; }

try {
    $count = $pdo->prepare("SELECT count(*) FROM passages_fts JOIN passages p ON p.id = passages_fts.rowid WHERE $where");
    $count->execute($args);
    $total = (int) $count->fetchColumn();

    $sql = "SELECT p.ep, p.t, p.t_end, e.title, e.url, e.youtube, e.date,
                   snippet(passages_fts, 0, '<mark>', '</mark>', '…', " . SNIPPET_WORDS . ") AS extrait,
                   bm25(passages_fts) AS score
            FROM passages_fts
            JOIN passages p ON p.id = passages_fts.rowid
            JOIN episodes e ON e.ep = p.ep
            WHERE $where
            ORDER BY score, p.ep DESC, p.t
            LIMIT :lim OFFSET :off";
    $stmt = $pdo->prepare($sql);
    foreach ($args as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', PER_PAGE, PDO::PARAM_INT);
    $stmt->bindValue(':off', ($page - 1) * PER_PAGE, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
} catch (PDOException $e) {
    // Ne jamais renvoyer le message SQL : il décrit la structure de la base.
    error_log('complorama-search: ' . $e->getMessage());
    fail(500, 'la recherche a échoué');
}

// Le passage a-t-il survécu au montage vidéo ? La correspondance est par
// morceaux : hors de tout intervalle connu, le passage a été coupé.
//
// Attention à ne pas confondre deux situations très différentes : « ce
// passage a été coupé au montage » est une affirmation sur le contenu, et
// on ne peut la faire que si l'alignement audio/vidéo de cet épisode a bien
// été calculé. Tant qu'il ne l'est pas, on l'ignore — et on le dit ainsi,
// plutôt que d'annoncer une coupe qu'on n'a pas constatée.
$mapStmt = $pdo->prepare('SELECT v_offset FROM video_map WHERE ep = ? AND a0 <= ? AND a1 > ? LIMIT 1');
$mappedStmt = $pdo->prepare('SELECT count(*) FROM video_map WHERE ep = ?');
$mapped = [];
$isMapped = function (int $ep) use ($mappedStmt, &$mapped): bool {
    if (!array_key_exists($ep, $mapped)) {
        $mappedStmt->execute([$ep]);
        $mapped[$ep] = ((int) $mappedStmt->fetchColumn()) > 0;
    }
    return $mapped[$ep];
};

$results = [];
foreach ($rows as $r) {
    $t = (float) $r['t'];
    $item = [
        'episode'  => (int) $r['ep'],
        'titre'    => $r['title'],
        'url'      => $r['url'],
        'date'     => $r['date'],
        'seconde'  => (int) round($t),
        'minutage' => timecode($t),
        'extrait'  => $r['extrait'],
    ];
    $vid = youtubeId($r['youtube']);
    if ($vid) {
        if (!$isMapped((int) $r['ep'])) {
            // Alignement audio/vidéo pas encore calculé pour cet épisode :
            // la vidéo existe, on y renvoie, mais sans prétendre savoir où.
            $item['video'] = ['url' => "https://www.youtube.com/watch?v=$vid", 'minutage_indisponible' => true];
        } else {
            $mapStmt->execute([$r['ep'], $t, $t]);
            $offset = $mapStmt->fetchColumn();
            if ($offset !== false) {
                $vt = max(0, (int) round($t + (float) $offset));
                $item['video'] = ['url' => "https://www.youtube.com/watch?v=$vid&t={$vt}s", 'minutage' => timecode((float) $vt)];
            } else {
                // Alignement connu, et ce passage n'y figure pas : coupé.
                $item['video'] = ['url' => "https://www.youtube.com/watch?v=$vid", 'coupe_au_montage' => true];
            }
        }
    }
    $results[] = $item;
}

echo json_encode([
    'requete'   => $q,
    'total'     => $total,
    'page'      => $page,
    'par_page'  => PER_PAGE,
    'resultats' => $results,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
