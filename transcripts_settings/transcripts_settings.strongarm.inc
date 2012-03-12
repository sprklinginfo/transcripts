<?php
/**
 * @file
 * transcripts_settings.strongarm.inc
 */

/**
 * Implements hook_strongarm().
 */
function transcripts_settings_strongarm() {
  $export = array();

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_all_tiers';
  $strongarm->value = 'ts_content_wylie, ts_content_eng, ts_content_zho';
  $export['transcripts_all_tiers'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_env_id';
  $strongarm->value = 'solr';
  $export['transcripts_env_id'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_hl_simple_post';
  $strongarm->value = '</span>';
  $export['transcripts_hl_simple_post'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_hl_simple_pre';
  $strongarm->value = '<span style="color:red;">';
  $export['transcripts_hl_simple_pre'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_id_mapper';
  $strongarm->value = '$node = node_load($id);

if ($node->type == \'video\') {
  $entryid = $node->field_video[\'und\'][0][\'entryid\'];
  if ($entryid) {
    $videotag = mb_kaltura_video_tag($entryid);
  }
}
else if ($node->type == \'audio\') {
  $entryid = $node->field_audio[\'und\'][0][\'entryid\'];
  if ($entryid) {
    $videotag = mb_kaltura_audio_tag($entryid);
  }
}

$transcript = "";
if (isset($node->field_transcript)) {
  $transcript = $node->field_transcript[$node->language][0][\'fid\'];
}

$val = array(
  \'video_tag\' => $videotag,
  \'transcript_id\' => $transcript,
);';
  $export['transcripts_id_mapper'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_page_id';
  $strongarm->value = 'core_search';
  $export['transcripts_page_id'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_result_link';
  $strongarm->value = 'default';
  $export['transcripts_result_link'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_saxon_jar';
  $strongarm->value = 'saxon9he.jar';
  $export['transcripts_saxon_jar'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_saxon_path';
  $strongarm->value = '/lv1/var/html/mediabase/sites/mediabase/lib/saxon';
  $export['transcripts_saxon_path'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_transcript_extensions';
  $strongarm->value = 'eaf trs xml';
  $export['transcripts_transcript_extensions'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_transcript_fields';
  $strongarm->value = array(
    'field_transcript' => 1,
    'field_friendly' => 0,
  );
  $export['transcripts_transcript_fields'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'transcripts_xslt_file';
  $strongarm->value = 'solr4drupal.xsl';
  $export['transcripts_xslt_file'] = $strongarm;

  return $export;
}
