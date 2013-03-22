<?php


/**
 * Define default flags.
 */
function transcripts_editor_flag_default_flags() {
	$flags = array();
	// Exported flag: "The transcript has been dirtied by online editing".
	$flags['transcripts_dirty_transcript'] = array(
		'content_type' => 'node',
		'title' => 'Dirty transcript',
		'global' => '1',
		'types' => array(
			0 => 'audio',
			1 => 'video',
		),
		'flag_short' => 'ADMIN Make dirty',
		'flag_long' => 'ADMIN Make dirty',
		'flag_message' => 'ADMIN Dirtied',
		'unflag_short' => 'Abandon changes and rebuild the interactive transcript',
		'unflag_long' => 'Abandon changes and rebuild the interactive transcript',
		'unflag_message' => 'An interactive transcript will be built from this file',
		'unflag_denied_text' => '',
		'link_type' => 'normal',
		'roles' => array(
			'flag' => array(
				0 => 2,
			),
			'unflag' => array(
				0 => 2,
			),
		),
		'weight' => 0,
		'show_on_form' => 0,
		'access_author' => '',
		'show_on_page' => 0,
		'show_on_teaser' => 0,
		'show_contextual_link' => 0,
		'i18n' => 0,
		'api_version' => 2,
	);
	return $flags;
}

/**
 * Allow modules to allow or deny access to flagging.
 *
 * @param $flag
 *  The flag object.
 * @param $content_id
 *  The id of the entity in question.
 * @param $action
 *  The action to test. Either 'flag' or 'unflag'.
 * @param $account
 *  The user on whose behalf to test the flagging action.
 *
 * @return
 *   Boolean TRUE if the user is allowed to flag/unflag the given content.
 *   FALSE otherwise.
 *
 * @see flag_flag:access()
 */
function transcripts_editor_flag_access($flag, $content_id, $action, $account) {
	if ($flag->name == "transcripts_dirty_transcript") {
	    if ($action == 'unflag') {
	        return (node_access('update', $content_id) && user_access('abandon transcript changes', $account)) ? TRUE : FALSE;
	    }
	    else {
	        return user_access('administer site configuration', $account) ? TRUE : FALSE; //only admin/debug flagging allowed
	    }
	}
}

function transcripts_editor_flag($op, $flag, $content_id, $account, $fcid) {
    if ($flag->name == 'transcripts_dirty_transcript' && $op == 'unflag') {
        watchdog("Transcripts", "Unflagging", NULL, WATCHDOG_WARNING);
        //delete row from table so that transcript is rebuilt
        db_delete('transcripts_transcript')
            ->condition('id', $content_id)
            ->execute();

        //assumes maximum one transcript per node
        $tcuids = db_select('tcu', 't')
		    ->fields('t', array('tcuid'))
			->condition('nid', $content_id)
			->execute()
			->fetchCol();
					
		if (count($tcuids) > 0) {
			tcu_delete_multiple($tcuids);
		}
		
		//to queue the node for re-indexing
		db_update('node')
		    ->fields(array(
		        'changed' => time()
		    ))
		    ->condition('nid', $content_id)
		    ->execute();
    }
}

/**
 * Implements hook_element_info().
 */
function transcripts_editor_element_info() {
  $elements = array();
  $elements['managed_file']['#process'] = array('transcripts_editor_file_field_process');
  return $elements;
}

function transcripts_editor_file_field_process($element, &$form_state, $form) {
  //should just return $element if not a transcript field
  
  $item = $element['#value'];
  $item['fid'] = $element['fid']['#value'];
  $nid = $form['nid']['#value'];

  $field = field_widget_field($element, $form_state);
  $instance = field_widget_instance($element, $form_state);
  $settings = $instance['widget']['settings'];

  if (!$item['fid'] || !$nid) {
  	$message = "Upload a file to build an interactive transcript.";
  }
  else if (flag_get_flag('transcripts_dirty_transcript')->is_flagged($nid)) {
		$message = t("This transcript has been changed by online editing; it is no longer up to date.");
		unset($element['remove_button']);
  }
  else {
		$index_position = apachesolr_get_last_index_position(transcripts_environment(), 'node');
		$max_changed = $index_position['last_changed'];
		$max_nid = $index_position['last_entity_id'];
		
		$node = node_load($nid);
		$file = file_load($item['fid']);
		
		//should confirm that this node type is really indexed
		
		//is it possible for an already existing file to be attached to a node?
		if ($file->status == 0 || ($file->timestamp >= $max_changed && ($node->changed > $max_changed || ($node->changed == $max_changed && $nid > $max_nid)))) {
			$message = t("This file will be used to build an interactive transcript.");
		}
		else {
			$message = t("This file was used to build an interactive transcript.");
		}
  }

  if ($item['fid'] && $nid && is_transcript_field($element['#field_name']) && transcripts_transcript_access($nid)) {
		$element['transcripts_dirty_transcript_link'] = array(
			'#prefix' => "<div class='transcripts_dirty_trancript_link form-item'>". $message ."<br/>",
			'#markup' => flag_create_link('transcripts_dirty_transcript', $nid),
			'#suffix' => "</div>",
			'#weight' => -10,
		);
  }
  
  return $element;
}
