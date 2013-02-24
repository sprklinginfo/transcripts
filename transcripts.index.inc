<?php
// $Id$

function transcripts_apachesolr_index_document_build_node($document, $node, $env_id) {
  $build_document = TRUE;
  foreach (module_implements('apachesolr_node_exclude') as $module) {
    $exclude = module_invoke($module, 'apachesolr_node_exclude', $node, $namespace);
    if (!empty($exclude)) {
      $build_document = FALSE;
    }
  }

  if ($build_document) {
    $files = transcripts_get_indexable_transcripts($node);
    $fids = array_keys($files);
    
		$result = db_select('transcripts_transcript', 'f')
			->fields('f', array('fid', 'module', 'type', 'status'))
			->condition('id', $node->nid)
			->execute(); 
  	
		foreach ($result as $file) {
			if (!in_array($file->fid, $fids)) {
				$tcuids = db_select('tcu', 't')
					->fields('t', array('tcuid'))
					->condition('nid', $node->nid)
					->condition('fid', $file->fid)
					->execute()
					->fetchCol();
					
				if (count($tcuids) > 0) {
					tcu_delete_multiple($tcuids);
				}
			}
			else { //already indexed, don't do it again
				unset($files[$file->fid]);
			}
		}
		
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
				$xml = transcripts_saxon_transform_text($file, $node, $extras);
				$arr = json_decode(json_encode(simplexml_load_string($xml)), TRUE);
				
				foreach ($arr['tcu'] as $tcu) {
					$insert = tcu_create(
						array(
							'nid' => $node->nid,
							'fid' => $file['fid'],
							'speaker' => isset($tcu['speaker']) ? $tcu['speaker'] : '',
							'start' => isset($tcu['start']) ? $tcu['start'] : 0,
							'end' => isset($tcu['end']) ? $tcu['end'] : 0,
							'created' => REQUEST_TIME,
							'changed' => REQUEST_TIME,
						)
					);
					$insert->setTiers(array_filter(array_map('trim', $tcu['tiers']))); //don't save empty tiers
					tcu_save($insert);
				}
					
				db_merge('transcripts_transcript')
					->key(array(
						'fid' => $file['fid'],
						'module' => 'transcripts',
						'type' => 'node',
						'id' => $node->nid,
					))
					->fields(array('status' => 1))
					->execute();
			}
		}
  }
}

function transcripts_saxon_transform_text($file, $node) {
	watchdog('Transcripts', "Indexing transcript at node/%nid", array('%nid' => $node->nid), WATCHDOG_INFO);
  
	$saxon_path = realpath(variable_get('transcripts_saxon_path', 'sites/all/libraries/saxon'));
	
	$xslfield = variable_get('transcripts_xslt_field','field_transcripts_xsl');
	if ($node->{$xslfield}) {
		$field = $node->{$xslfield};
		$uri = $field[$node->language][0]['uri'];
		$xslt = drupal_realpath($node->{$xslfield}[$node->language][0]['uri']);
	} else {
		$xslt = realpath($saxon_path . '/' . variable_get('transcripts_xslt_file', ''));
	}
	
  $saxon = realpath($saxon_path . '/' . variable_get('transcripts_saxon_jar', 'saxon9he.jar'));
  if (!$saxon || !is_file($saxon)) {
    throw new Exception(t('Invalid path or filename for saxon application jar.'));
  }

  $filepath = drupal_realpath($file['uri']);
  // Check that we have a valid filepath.
  if (!$filepath || !is_file($filepath)) {
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
  
  // By default force UTF-8 output
  $cmd .= escapeshellcmd(variable_get('transcripts_java', 'java')) . ' ' .
    escapeshellarg(variable_get('transcripts_java_opts', '-Dfile.encoding=UTF8')) .
    ' -jar ' . escapeshellarg($saxon) .
    ' -s:'. escapeshellarg($filepath) . ' -xsl:' . escapeshellarg($xslt); //. ' 2>&1'; //for debugging
  
  watchdog('Transcripts', "$cmd", NULL, WATCHDOG_DEBUG);
  
  $document = shell_exec($cmd);
  
  return $document;
}

function transcripts_get_indexable_transcripts($node) {
  $files = array();

  $field_names = transcripts_all_file_fields();
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
