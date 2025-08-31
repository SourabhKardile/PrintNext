<?php
// Set headers to allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Directory containing portfolio images
$directory = 'images/portfolio/';

// Valid image extensions
$valid_extensions = array('jpg', 'jpeg', 'png', 'gif');

// Get all files from the directory
$files = array();
if (is_dir($directory)) {
    if ($handle = opendir($directory)) {
        while (($file = readdir($handle)) !== false) {
            if ($file != "." && $file != "..") {
                // Get file extension
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                
                // Check if it's a valid image extension
                if (in_array($ext, $valid_extensions)) {
                    // Add to our files array with full path
                    $files[] = array(
                        'src' => $directory . $file,
                        'alt' => 'Portfolio Work - ' . pathinfo($file, PATHINFO_FILENAME)
                    );
                }
            }
        }
        closedir($handle);
    }
}

// Sort files alphabetically
usort($files, function($a, $b) {
    return strcmp($a['src'], $b['src']);
});

// Return the JSON response
echo json_encode(array('images' => $files));
?>