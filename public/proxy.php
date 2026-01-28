<?php
// Autoriser React à lire la réponse
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/calendar; charset=utf-8");

// Récupérer l'URL passée en paramètre
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    
    // Validation basique pour sécurité
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        // Essayer avec file_get_contents (plus simple)
        $content = @file_get_contents($url);
        
        // Si file_get_contents échoue (parfois désactivé sur certains hébergements), utiliser cURL
        if ($content === false) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Utile pour éviter les erreurs SSL strictes
            $content = curl_exec($ch);
            curl_close($ch);
        }
        
        echo $content;
    } else {
        http_response_code(400);
        echo "Invalid URL";
    }
} else {
    echo "No URL provided";
}
?>