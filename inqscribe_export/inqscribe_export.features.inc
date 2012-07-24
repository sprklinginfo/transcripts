<?php
/**
 * @file
 * inqscribe_export.features.inc
 */

/**
 * Implements hook_views_api().
 */
function inqscribe_export_views_api() {
  return array(
  	"version" => "3.0",
    "template path" => drupal_get_path("module", "inqscribe_export") . "/templates",
  );
}

function inqscribe1000fps($seconds) {
	if ($seconds == 0) {
		return "00:00:00.000";
	}
	else {
		$decimal = substr(number_format($seconds, 3), -3);
		$seconds = floor($seconds);
		$s = $seconds % 60;
		$m = floor($seconds / 60);
		$h = floor($seconds / 3600);
		return sprintf("%02d:%02d:%02d", $h, $m, $s) . "." . $decimal;
	}
}
