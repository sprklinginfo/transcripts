<?php
/**
 * @file
 * transcripts_editor_disable.features.inc
 */

/**
 * Implements hook_flag_default_flags().
 */
function transcripts_editor_disable_flag_default_flags() {
	$flags = array();
	//Exported flag: "Disable editing of transcript".
	$flags['transcripts_editor_disable'] = array(
		'entity_type' => 'node',
		'title' => 'Disable editing of transcript',
		'global' => '1',
		'types' => 
			array (
				0 => 'audio',
				1 => 'video',
			),
		'flag_short' => 'Disable online editing of this transcript',
		'flag_long' => 'You can re-enable transcript editing again later.',
		'flag_message' => 'Online editing of this transcript has been disabled.',
		'unflag_short' => 'Re-enable online editing of this transcript',
		'unflag_long' => 'Click here to make the transcript editable again.',
		'unflag_message' => 'Online editing of this transcript has been re-enabled.',
		'unflag_denied_text' => 'The online editor for this transcript has been disabled.',
		'link_type' => 'toggle',
		'weight' => 0,
		'show_on_form' => 0,
		'access_author' => '',
		'show_on_page' => 0,
		'show_on_teaser' => 0,
		'show_contextual_link' => 0,
		'i18n' => 0,
		'api_version' => 3,
		'module' => 'transcripts_editor_disable',
		'locked' => 
			array (
				'name' => 'name',
			),
		'status' => true,
	);
	return $flags;
}