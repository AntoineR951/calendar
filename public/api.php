<?php
// Permettre l'accès depuis n'importe où (ou restreindre à votre domaine si besoin)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Le fichier où sont stockées les données
$file = 'events.json';

// Gérer la requête de sauvegarde (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer le contenu brut envoyé par React
    $json = file_get_contents('php://input');
    
    // Vérifier si c'est du JSON valide
    $data = json_decode($json);
    if ($data !== null) {
        // Sauvegarder dans le fichier
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(["status" => "success", "message" => "Données sauvegardées"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "JSON invalide"]);
    }
    exit;
}

// Gérer la requête de lecture (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        // Si le fichier n'existe pas encore, renvoyer un tableau vide
        echo "[]";
    }
    exit;
}
?>