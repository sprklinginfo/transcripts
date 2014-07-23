<?php
// $Id$

function transcripts_node_node_delete($node) {
    $fields = array_filter(transcripts_node_all_file_fields(), 'is_transcript_field');
    
    if (count($fields) > 0) {
        transcripts_remove_transcript('transcripts_node', 'node', $node->nid);
    }
}

function transcripts_node_node_insert($node) {
    $fields = array_filter(transcripts_node_all_file_fields(), 'is_transcript_field');
    
    foreach ($fields as $field_name) {
        $field = $node->$field_name;
        
        if (!(empty($field) || empty($field[$node->language]))) {
            $fid = $field[$node->language][0]['fid'];
            transcripts_node_add_transcript(file_load($fid), node_load($node->nid));
        }
    }
}

function transcripts_node_node_update($node) {
    $fields = array_filter(transcripts_node_all_file_fields(), 'is_transcript_field');
    
    foreach ($fields as $field_name) {
        $field = $node->$field_name;
        
        if (empty($field) || empty($field[$node->language])) {
            transcripts_remove_transcript('transcripts_node', 'node', $node->nid);
        }
        else {
            $fid = $field[$node->language][0]['fid'];
            if (!transcripts_already_indexed('transcripts_node', 'node', $node->nid, $fid)) {
                transcripts_remove_transcript('transcripts_node', 'node', $node->nid);
                transcripts_node_add_transcript(file_load($fid), node_load($node->nid));
            }            
        }
    }
}

function transcripts_node_add_transcript($file, $node) {
	$tcus = transcripts_xslt_as_tcus($file, $node);
	transcripts_add_transcript('transcripts_node', 'node', $file->fid, $node->nid, $tcus);
}

/*
function transcripts_node_get_indexable_transcripts($node) {
  $files = array();

  $field_names = transcripts_node_all_file_fields();
  foreach ($field_names as $field_name) {
    if (!empty($node->$field_name) && is_transcript_field($field_name)) {
      $field = $node->$field_name;
      list($lang, $values) = each($field);
      $files = array_merge($files, $values);
    }
  }

  $file_list = array();
  foreach ($files as $file) {
  	$extension = strrchr($file['filename'], '.');
  	if ($extension && transcripts_node_check_extension(substr($extension, 1))) {
      $file_list[$file['fid']] = $file;
    }
  }
  return $file_list;
}
*/
