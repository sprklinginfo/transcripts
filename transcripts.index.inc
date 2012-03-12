<?php
// $Id$

/**
 * Callback for apachesolr_index_nodes().
 *
 * Adds a document for each indexable file attachment for the given node ID.
 *
 * @see apachesolr_node_to_document()
 */
//function transcripts_add_documents($node, $namespace) {
function transcripts_apachesolr_index_document_build_node($document, $node, $env_id) {
	$documents = array();
  $hash = apachesolr_site_hash();
  // Let any module exclude this node from the index.
  $build_document = TRUE;
  foreach (module_implements('apachesolr_node_exclude') as $module) {
    $exclude = module_invoke($module, 'apachesolr_node_exclude', $node, $namespace);
    if (!empty($exclude)) {
      $build_document = FALSE;
    }
  }

  if ($build_document) {
    // Since there is no notification for an attachment being unassociated with a
    // node (but that action will trigger it to be indexed again), we check for
    // fids that were added before but no longer present on this node.
    $fids = array();
    $result = db_query("SELECT fid FROM {transcripts_transcript} WHERE nid = :nid", array(':nid' => $node->nid));
    foreach ($result as $row) {
      $fids[$row->fid] = $row->fid;
    }
    
    $files = transcripts_get_indexable_transcripts($node);
    
    if (count($files) > 0) {
      //inherit node taxonomies
      $extras = array(); //$fields[] = array('key' => $index_key, 'value' => $ancestor->tid,);
      /*$indexed_fields = apachesolr_entity_fields('node');
      foreach ($indexed_fields as $index_key => $field_info) {
      	if ($field_info['field']['type'] == 'taxonomy_term_reference') {
      		$field_name = $field_info['field']['field_name'];
          if (isset($node->{$field_name})) {
            $function = $field_info['indexing_callback'];
            if ($function && function_exists($function)) {
              $fields = $function($node, $field_name, $index_key, $field_info);
              $extras = array_merge($extras, $fields);
            }
          }
        }
      }*/
    
			foreach ($files as $file) {
				$rawPost = transcripts_saxon_transform_text($file, $node, $extras);
				//watchdog('Transcripts', "Rawpost - $rawPost", NULL, WATCHDOG_ERROR);
				$solr = transcripts_get_solr(); //within try-catch?
				$solr->update($rawPost);
			}
			$solr->commit();
		}
  }
  //return array(); //empty array of documents
}

/**
 * Transform the transcript getting just the raw text.
 *
 * @throws Exception
 */
function transcripts_saxon_transform_text($file, $node, $extras) {
	watchdog('Transcripts', "Indexing transcript at nid %nid", array('%nid' => $node->nid), WATCHDOG_NOTICE);
  
	$saxon_path = realpath(variable_get('transcripts_saxon_path', ''));
  $xslt = realpath($saxon_path . '/' . variable_get('transcripts_xslt_file', ''));
  $saxon = realpath($saxon_path . '/' . variable_get('transcripts_saxon_jar', 'saxon9he.jar'));
  if (!$saxon || !is_file($saxon)) {
    throw new Exception(t('Invalid path or filename for saxon application jar.'));
  }

  $filepath = drupal_realpath($file['uri']);
  // Check that we have a valid filepath.
  if (!$filepath) {
    return FALSE;
  }
  elseif (!is_file($filepath)) {
    watchdog('Transcripts', '%filepath is not a valid file path', array('%filepath' => $file['uri']), WATCHDOG_WARNING);
    return FALSE;
  }
  
  $cmd = '';
  // Add a work-around for a MAMP bug + java 1.5.
  if (strpos(ini_get('extension_dir'), 'MAMP/')) {
    $cmd .= 'export DYLD_LIBRARY_PATH=""; ';
  }
  // Support UTF-8 encoded filenames.
  if (mb_detect_encoding($filepath, 'ASCII,UTF-8', true) == 'UTF-8') {
    $cmd .= 'export LANG="en_US.utf-8"; ';
    setlocale(LC_CTYPE, 'UTF8', 'en_US.UTF-8');
  }
  
  $path = 'node/' . $node->nid;
  if (function_exists('drupal_get_path_alias')) {
  	// Add any path alias to the index, looking first for language specific
    // aliases but using language neutral aliases otherwise.
    $language = empty($node->language) ? NULL : $node->language;
    $output = drupal_get_path_alias($path, $language);
    if ($output && $output != $path) {
    	$path = $output;
    }
  }
  
  $params = array();
  foreach ($extras as $extra) {
  	$params[] = $extra['key'] . '=' . escapeshellarg($extra['value']);
  }
  $more = '"' . implode(',',$params) . '"';
  
  // By default force UTF-8 output
  $cmd .= escapeshellcmd(variable_get('transcripts_java', 'java')) . ' ' .
    escapeshellarg(variable_get('transcripts_java_opts', '-Dfile.encoding=UTF8')) .
    ' -jar ' . escapeshellarg($saxon) .
    ' -s:'. escapeshellarg($filepath) . ' -xsl:' . escapeshellarg($xslt) .
    ' nid=' . $node->nid .
    ' nlabel=' . escapeshellarg($node->title) .
    //' nlabel="' . escapeshellarg($node->title) . '"' .
    ' fid=' . $file['fid'] .
    ' site=' . url(NULL, array('absolute' => TRUE)) .
    ' hash=' . apachesolr_site_hash() .
    ' path=' . $path .
    ' extras=' . $more; //. ' 2>&1'; //for debugging
  
  watchdog('Transcripts', "Saxon - $cmd", NULL, WATCHDOG_ERROR);
    
  return shell_exec($cmd);
}

/**
 * Return all transcripts for a particular node.
 */
function transcripts_get_indexable_transcripts($node) {
  $files = array();

  $field_names = transcripts_get_field_names();
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
  	if ($extension && transcripts_check_extension(substr($extension, 1))) {
      $file_list[$file['fid']] = $file;
    }
  }
  return $file_list;
}

/**
 * Return all fields that are of type 'file'. Copied from apachesolr_attachments.
 */

function transcripts_get_field_names() {
  $field_names = array();
  if (module_exists('file')) {
    $fields = field_info_fields();
    foreach ($fields as $field_name => $field) {
      if ($field['type'] == 'file') {
        $field_names[] = $field_name;
      }
    }
  }
  return $field_names;
}

?>
