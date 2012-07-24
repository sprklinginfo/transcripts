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

  $view = new view;
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
  $handler->display->display_options['access']['type'] = 'none';
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
  $handler->display->display_options['fields']['fts_start']['alter']['alter_text'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['make_link'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['absolute'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['external'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['replace_spaces'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['trim_whitespace'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['nl2br'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['word_boundary'] = 1;
  $handler->display->display_options['fields']['fts_start']['alter']['ellipsis'] = 1;
  $handler->display->display_options['fields']['fts_start']['alter']['more_link'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['strip_tags'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['trim'] = 0;
  $handler->display->display_options['fields']['fts_start']['alter']['html'] = 0;
  $handler->display->display_options['fields']['fts_start']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['fts_start']['element_default_classes'] = 1;
  $handler->display->display_options['fields']['fts_start']['hide_empty'] = 0;
  $handler->display->display_options['fields']['fts_start']['empty_zero'] = 0;
  $handler->display->display_options['fields']['fts_start']['hide_alter_empty'] = 1;
  /* Field: Apache Solr: ss_speaker */
  $handler->display->display_options['fields']['ss_speaker']['id'] = 'ss_speaker';
  $handler->display->display_options['fields']['ss_speaker']['table'] = 'apachesolr__solr';
  $handler->display->display_options['fields']['ss_speaker']['field'] = 'ss_speaker';
  $handler->display->display_options['fields']['ss_speaker']['label'] = '';
  $handler->display->display_options['fields']['ss_speaker']['alter']['alter_text'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['make_link'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['absolute'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['external'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['replace_spaces'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['trim_whitespace'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['nl2br'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['word_boundary'] = 1;
  $handler->display->display_options['fields']['ss_speaker']['alter']['ellipsis'] = 1;
  $handler->display->display_options['fields']['ss_speaker']['alter']['more_link'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['strip_tags'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['trim'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['alter']['html'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['ss_speaker']['element_default_classes'] = 1;
  $handler->display->display_options['fields']['ss_speaker']['hide_empty'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['empty_zero'] = 0;
  $handler->display->display_options['fields']['ss_speaker']['hide_alter_empty'] = 1;
  /* Field: Apache Solr: fts_end */
  $handler->display->display_options['fields']['fts_end']['id'] = 'fts_end';
  $handler->display->display_options['fields']['fts_end']['table'] = 'apachesolr__solr';
  $handler->display->display_options['fields']['fts_end']['field'] = 'fts_end';
  $handler->display->display_options['fields']['fts_end']['label'] = '';
  $handler->display->display_options['fields']['fts_end']['alter']['alter_text'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['make_link'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['absolute'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['external'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['replace_spaces'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['trim_whitespace'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['nl2br'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['word_boundary'] = 1;
  $handler->display->display_options['fields']['fts_end']['alter']['ellipsis'] = 1;
  $handler->display->display_options['fields']['fts_end']['alter']['more_link'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['strip_tags'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['trim'] = 0;
  $handler->display->display_options['fields']['fts_end']['alter']['html'] = 0;
  $handler->display->display_options['fields']['fts_end']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['fts_end']['element_default_classes'] = 1;
  $handler->display->display_options['fields']['fts_end']['hide_empty'] = 0;
  $handler->display->display_options['fields']['fts_end']['empty_zero'] = 0;
  $handler->display->display_options['fields']['fts_end']['hide_alter_empty'] = 1;
  /* Filter criterion: Apache Solr: is_nid */
  $handler->display->display_options['filters']['is_nid']['id'] = 'is_nid';
  $handler->display->display_options['filters']['is_nid']['table'] = 'apachesolr__solr';
  $handler->display->display_options['filters']['is_nid']['field'] = 'is_nid';
  $handler->display->display_options['filters']['is_nid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['is_nid']['expose']['operator_id'] = '';
  $handler->display->display_options['filters']['is_nid']['expose']['label'] = 'is_nid';
  $handler->display->display_options['filters']['is_nid']['expose']['use_operator'] = FALSE;
  $handler->display->display_options['filters']['is_nid']['expose']['operator'] = 'is_nid_op';
  $handler->display->display_options['filters']['is_nid']['expose']['identifier'] = 'node';

  /* Display: Data export */
  $handler = $view->new_display('views_data_export', 'Data export', 'views_data_export_1');
  $handler->display->display_options['pager']['type'] = 'none';
  $handler->display->display_options['pager']['options']['offset'] = '0';
  $handler->display->display_options['style_plugin'] = 'views_data_export_txt';
  $handler->display->display_options['style_options']['provide_file'] = 1;
  $handler->display->display_options['style_options']['filename'] = 'inqscribe-%exposed.txt';
  $handler->display->display_options['style_options']['parent_sort'] = 0;
  $handler->display->display_options['path'] = 'inqscribe-export';
  $export['inqscribe_export'] = $view;

  return $export;
}
