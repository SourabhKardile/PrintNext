<?php
/**
 * Portfolio Image API
 * Optimized for caching and faster loading
 */

// Set caching headers
$cache_time = 86400; // 24 hours
header('Cache-Control: public, max-age=' . $cache_time);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $cache_time) . ' GMT');
header('ETag: ' . md5_file(__FILE__) . '-' . filemtime(__FILE__));

// Handle client caching (304 Not Modified)
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
    $last_modified = filemtime(__FILE__);
    $if_modified_since = strtotime(preg_replace('/;.*$/', '', $_SERVER['HTTP_IF_MODIFIED_SINCE']));
    if ($if_modified_since >= $last_modified) {
        header('HTTP/1.0 304 Not Modified');
        exit;
    }
}

// Set CORS and content-type headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Directory containing portfolio images
$directory = 'images/portfolio/';
$cache_file = 'portfolio-cache.json';

// Check if we have a valid cache file that's recent enough
if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_time)) {
    // Serve the cached response
    echo file_get_contents($cache_file);
    exit;
}

// Valid image extensions
$valid_extensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');

// Get all files from the directory
$files = array();
if (is_dir($directory)) {
    if ($handle = opendir($directory)) {
        while (($file = readdir($handle)) !== false) {
            if ($file != "." && $file != "..") {
                // Get file extension
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $filename = pathinfo($file, PATHINFO_FILENAME);
                
                // Check if it's a valid image extension
                if (in_array($ext, $valid_extensions)) {
                    // Get image dimensions if possible
                    $dimensions = array(0, 0);
                    try {
                        if (function_exists('getimagesize')) {
                            $dimensions = getimagesize($directory . $file);
                        }
                    } catch (Exception $e) {
                        // Silently fail if we can't get dimensions
                    }
                    
                    // Add to our files array with full path and additional metadata
                    $files[] = array(
                        'src' => $directory . $file,
                        'srcset' => $directory . $file . ' ' . ($dimensions[0] ?? 800) . 'w',
                        'alt' => 'PrintNext Portfolio - ' . ucwords(str_replace('-', ' ', $filename)),
                        'width' => $dimensions[0] ?? 800,
                        'height' => $dimensions[1] ?? 600,
                        'title' => ucwords(str_replace('-', ' ', $filename)),
                        'loading' => 'lazy'
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

// Generate the JSON response
$response = json_encode(array(
    'images' => $files,
    'total' => count($files),
    'generated' => date('Y-m-d H:i:s')
));

// Save to cache file
file_put_contents($cache_file, $response);

// Return the JSON response
echo $response;
?>