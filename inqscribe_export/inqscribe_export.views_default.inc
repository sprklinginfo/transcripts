<?php
/**
 * @file
 * inqscribe_export.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function inqscribe_export_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'inqscribe_export';
  $view->description = '';
  $view->tag = 'transcripts';
  $view->base_table = 'apachesolr__solr';
  $view->human_name = 'InqScribe Export';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'perm';
  $handler->display->display_options['access']['perm'] = 'view transcripts';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['style_plugin'] = 'default';
  $handler->display->display_options['row_plugin'] = 'fields';
  /* Field: Apache Solr: fts_start */
  $handler->display->display_options['fields']['fts_start']['id'] = 'fts_start';
  $handler->display->display_options['fields']['fts_start']['table'] = 'apachesolr__solr';
  $handler->display->display_options['fields']['fts_start']['field'] = 'fts_start';
  $handler->display->display_options['fields']['fts_start']['label'] = '';
  $handler->display->display_options['fields']['fts_start']['element_label_colon'] = FALSE;
  /* Field: Apache Solr: ss_speaker */
  $handler->display->display_options['fields']['ss_speaker']['id'] = 'ss_speaker';
  $handler->display->display_options['fields']['ss_speaker']['table'] = 'apachesolr__solr';
  $handler->display->display_options['fields']['ss_speaker']['field'] = 'ss_speaker';
  $handler->display->display_options['fields']['ss_speaker']['label'] = '';
  $handler->display->display_options['fields']['ss_speaker']['element_label_colon'] = FALSE;
  /* Field: Apache Solr: fts_end */
  $handler->display->display_options['fields']['fts_end']['id'] = 'fts_end';
  $handler->display->display_options['fields']['fts_end']['table'] = 'apachesolr__solr';
  $handler->display->display_options['fields']['fts_end']['field'] = 'fts_end';
  $handler->display->display_options['fields']['fts_end']['label'] = '';
  $handler->display->display_options['fields']['fts_end']['element_label_colon'] = FALSE;
  /* Contextual filter: Apache Solr: is_nid */
  $handler->display->display_options['arguments']['is_nid']['id'] = 'is_nid';
  $handler->display->display_options['arguments']['is_nid']['table'] = 'apachesolr__solr';
  $handler->display->display_options['arguments']['is_nid']['field'] = 'is_nid';
  $handler->display->display_options['arguments']['is_nid']['default_action'] = 'empty';
  $handler->display->display_options['arguments']['is_nid']['default_argument_type'] = 'fixed';
  $handler->display->display_options['arguments']['is_nid']['summary']['number_of_records'] = '0';
  $handler->display->display_options['arguments']['is_nid']['summary']['format'] = 'default_summary';
  $handler->display->display_options['arguments']['is_nid']['summary_options']['items_per_page'] = '25';

  /* Display: Data export */
  $handler = $view->new_display('views_data_export', 'Data export', 'views_data_export_1');
  $handler->display->display_options['defaults']['hide_admin_links'] = FALSE;
  $handler->display->display_options['pager']['type'] = 'none';
  $handler->display->display_options['pager']['options']['offset'] = '0';
  $handler->display->display_options['style_plugin'] = 'views_data_export_txt';
  $handler->display->display_options['style_options']['provide_file'] = 1;
  $handler->display->display_options['style_options']['filename'] = 'inqscribe-%1-value.txt';
  $handler->display->display_options['style_options']['parent_sort'] = 0;
  $handler->display->display_options['path'] = 'node/%/inqscribe';
  $export['inqscribe_export'] = $view;

  return $export;
}
