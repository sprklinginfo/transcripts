<?php
/**
 * @file
 * inqscribe_export.features.inc
 */

/**
 * Implements hook_views_api().
 */
function inqscribe_export_views_api() {
    /* see https://drupal.org/node/627378#comment-6444570 */
    return array(
        'api' => 3,
        'template path' => drupal_get_path('module', 'inqscribe_export') . '/templates',
    );
}
