<?php
// $Id$

function transcripts_profile_delete($pid) {
  $profile = transcripts_profile_load($pid);
  if ($profile) {
    db_delete('transcripts_display_profile')
      ->condition('pid', $pid)
      ->execute();
    return true;
  }
  return false;
}

function transcripts_profile_save($profile) {
	$profile['modes'] = serialize($profile['modes']);
	$profile['tiers'] = serialize(improved_list_extract_allowed_values($profile['tiers']));
  $default = array('pid' => NULL, 'uid' => '', 'menu' => '', 'tiers' => '', 'modes' => '', 'default_mode' => '');
  $profile = array_intersect_key($profile, $default);
  $is_new = !transcripts_profile_load($profile['pid']);

  if ($is_new) {
    db_insert('transcripts_display_profile')
      ->fields($profile)
      ->execute();
  }
  else {
    db_update('transcripts_display_profile')
      ->fields($profile)
      ->condition('pid', $profile['pid'])
      ->execute();
  }
}

function transcripts_profile_delete_form($form, &$form_state, $profile) {
  $form['pid'] = array(
    '#type' => 'value',
    '#value' => $profile['pid'],
  );
  return confirm_form(
    $form,
    t('Are you sure you want to delete the profile %pid?', array('%pid' => $profile['pid'])),
    'admin/config/search/apachesolr/transcripts',
    t('This action cannot be undone.'),
    t('Delete'),
    t('Cancel')
  );
}

function transcripts_profile_delete_form_submit($form, &$form_state) {
  if (transcripts_profile_delete($form_state['values']['pid'])) {
    drupal_set_message(t('The profile has been deleted'));
  }
  $form_state['redirect'] = 'admin/config/search/apachesolr/transcripts';
}

/**
 * Form builder for adding/editing a Solr environment used as a menu callback.
 */
function transcripts_profile_edit_form($form, &$form_state, $profile = NULL) {
	global $user;
	
  if (empty($profile)) {
    $profile = array();
  } 
  $profile += array('pid' => '', 'uid' => '', 'menu' => '', 'tiers' => array(), 'modes' => array(), 'default_mode' => '');
  
  $form['pid'] = array(
    '#type' => 'machine_name',
    '#title' => t('Profile id'),
    '#machine_name' => array(
      'exists' => 'transcripts_profile_load',
    ),
    '#default_value' => $profile['pid'],
    '#disabled' => !empty($profile['pid']), // Cannot change it once set.
    '#description' => t('Unique, machine-readable identifier for this Transcripts display profile. This name must contain only lowercase letters, numbers, and underscores.'),
    '#required' => TRUE,
  );
  $form['uid'] = array(
  	'#type' => 'hidden',
  	'#value' => $user->uid,
  );
  $form['menu'] = array(
    '#type' => 'textfield',
    '#title' => t('Menu'),
    '#default_value' => $profile['menu'],
    '#description' => t('The unique menu name for this display profile'),
    '#required' => TRUE,
  );
  $form['tiers'] = array(
  	'#type' => 'textarea',
  	'#title' => t('List of transcript tiers'),
  	'#default_value' => improved_list_allowed_values_string($profile['tiers'], "\n"),
  	'#required' => TRUE,
  	'#rows' => 10,
  	'#description' => 
  		t(	'<p>Transcript tiers. 
  				Enter one value per line, in the format <strong>id|name</strong>: 
  				<strong>id</strong> identifies the tier in the search index and elsewhere,
  				and <strong>name</strong> is the display-friendly name of the tier.
  				Tiers will be displayed in the order they are listed here.
  				For example, given the following:<ul>
  				<li><strong>bod|Tibetan</strong><br/></li>
  				<li><strong>quh|Quechua</strong><br/></li>
  				<li><strong>eng|English</strong><br/></li>
  				</ul>Tibetan will be displayed first, followed by Quechua and then English.</p>	')
  );
  $form['modes'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Display modes'),
    '#default_value' => $profile['modes'],
    '#options' => transcripts_all_modes(),
    '#description' => t('Select the display modes you want to enable.'),
  );
  $form['default_mode'] = array(
    '#type' => 'radios',
    '#title' => t('Default mode'),
    '#default_value' => $profile['default_mode'],
    '#options' => transcripts_all_modes(),
    '#description' => t('Select the default display mode.'),
  );
  
  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['save'] = array(
    '#type' => 'submit',
    '#submit' => array('transcripts_profile_save_submit'),
    '#value' => t('Save'),
  );

  // Ensures destination is an internal URL, builds "cancel" link.
  if (isset($_GET['destination']) && !url_is_external($_GET['destination'])) {
    $destination = $_GET['destination'];
  }
  else {
    $destination = 'admin/config/search/apachesolr/transcripts';
  }
  $form['actions']['cancel'] = array(
    '#type' => 'link',
    '#title' => t('Cancel'),
    '#href' => $destination,
  );

  return $form;
}

function transcripts_profile_save_submit($form, &$form_state) {
  transcripts_profile_save($form_state['values']);
  menu_rebuild();
  drupal_set_message(t('The profile %pid has been saved', array('%pid' => $form_state['values']['pid'])));
  $form_state['redirect'] = 'admin/config/search/apachesolr/transcripts';
}

function transcripts_solr_settings() {
  $form = array();
  $environments = apachesolr_load_all_environments();
  foreach ($environments as $id => $environment) {
    $options[$id] = $environment['name'];
  }
  $form['transcripts_solr_settings'] = array(
    '#title' => t('Solr settings '),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['transcripts_solr_settings']['transcripts_env_id'] = array(
    '#title' => t('Search environment'),
    '#type' => 'select',
    '#options' => $options,
    '#default_value' => transcripts_environment(),
    '#description' => t('The Solr search environment that is used by this module.'),
    '#weight' => -30,
  );
  return $form;
}

function transcripts_saxon_settings() {
  $form = array();
  $form['transcripts_saxon_settings'] = array(
    '#title' => t('Saxon XSLT Processor'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['transcripts_saxon_settings']['transcripts_saxon_path'] = array(
    '#type' => 'textfield',
    '#title' => t('Saxon directory path'),
    '#size' => 80,
    '#maxlength' => 100,
    '#description' => t("The relative path from the Drupal root to the Saxon directory. All library jars must be in the same directory. Do not include a leading slash."),
    '#default_value' => variable_get('transcripts_saxon_path', 'sites/all/libraries/saxon'),
  );
  $form['transcripts_saxon_settings']['transcripts_saxon_jar'] = array(
    '#type' => 'textfield',
    '#title' => t('Saxon jar file'),
    '#size' => 20,
    '#description' => t("The name of the Saxon application jar file (e.g. saxon9he.jar)."),
    '#default_value' => variable_get('transcripts_saxon_jar', 'saxon9he.jar'),
  );
  return $form;
}

function transcripts_index_settings() {	
	$form = array();
  $form['transcripts_indexing_settings'] = array(
    '#title' => t('Indexing settings'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $default = implode(' ', transcripts_default_transcript_extensions());
  $form['transcripts_indexing_settings']['transcripts_transcript_extensions'] = array(
    '#type' => 'textfield',
    '#title' => t('Transcript extensions'),
    '#default_value' => variable_get('transcripts_transcript_extensions', $default),
    '#size' => 80,
    '#maxlength' => 255,
    '#description' => t('File extensions that are treated as transcripts. Separate extensions with a space and do not include the leading dot.'),
  );
  $form['transcripts_indexing_settings']['transcripts_xslt_file'] = array(
    '#type' => 'textfield',
    '#title' => t('Default XSLT file'),
    '#size' => 20,
    '#description' => t("The default XSLT file to be used to transform incoming transcripts into a format to be used by Drupal and Solr."),
    '#default_value' => variable_get('transcripts_xslt_file', ''),
  );
  $message = "Specify the name of an existing file field to allow users the ability to use a different stylesheet. "
  					."Users will then be able to drive transformations to Drupal and Solr using their own stylesheets.";
  $form['transcripts_indexing_settings']['transcripts_xslt_field'] = array(
    '#type' => 'textfield',
    '#title' => t('File field for XSLT overrides'),
    '#size' => 20,
    '#description' => t($message),
    '#default_value' => variable_get('transcripts_xslt_field', ''),
  );

  return $form;
}

function transcripts_search_settings() {
	$form = array();
  $form['transcripts_search_results'] = array(
    '#title' => t('Search results'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $profiles = transcripts_all_profiles();
  $options = array();
  $options['NODE'] = t('Node');
  $options['PLAYER'] = t('Transcript player');
  /*
  foreach ($profiles as $pid => $data) {
  	$options[$data['menu']] = "Transcript player: ".$pid;
  }*/
  $form['transcripts_search_results']['transcripts_result_link'] = array(
  	'#title' => t('Link results to'),
    '#type' => 'select',
    '#options' => $options,
    '#default_value' => variable_get('transcripts_result_link', 'NODE'),
  	'#description' => t('Which page do you want search results to link to?'),
  	'#required' => TRUE,
  );
  $form['transcripts_search_results']['transcripts_hl_simple_pre'] = array(
    '#type' => 'textfield',
    '#title' => t('HTML to precede hit'),
    '#default_value' => variable_get('transcripts_hl_simple_pre', '<span style="color:red;">'),
    '#description' => t('What HTML code should precede a hit?'),
    '#required' => TRUE,
  );
  $form['transcripts_search_results']['transcripts_hl_simple_post'] = array(
    '#type' => 'textfield',
    '#title' => t('HTML to follow hit'),
    '#default_value' => variable_get('transcripts_hl_simple_post', '</span>'),
    '#description' => t('What HTML code should follow a hit?'),
    '#required' => TRUE,
  );
  return $form;
}

function transcripts_display_settings() {
	$form = array();
  $form['transcripts_display_settings'] = array(
    '#title' => t('Transcript display'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['transcripts_display_settings']['bundles'] = array(
    '#type' => 'markup',
    '#markup' => t('Specify the entity types and bundles that can have transcripts.'),
  );
  foreach (entity_get_info() as $entity_type => $entity_info) {
    if (!empty($entity_info['apachesolr']['indexable'])) {
      $options = array();
      foreach ($entity_info['bundles'] as $key => $info) {
        $options[$key] = $info['label'];
      }
      $form['transcripts_display_settings']['entities']['transcripts_'.$entity_type] = array(
        '#type' => 'checkboxes',
        '#title' => check_plain($entity_info['label']),
        '#options' => $options,
        '#default_value' => variable_get('transcripts_'.$entity_type, array()),
      );
    }
  }
  $form['transcripts_display_settings']['transcripts_all_tiers'] = array(
  	'#title' => t('Transcript tiers'),
  	'#type' => 'textfield',
  	'#size' => 150,
  	'#default_value' => variable_get('transcripts_all_tiers', ''),
  	'#description' => t('Enter a comma-separated list of all transcript tiers. These tiers will be searched and shown in search results.'),
  	'#required' => TRUE,
  );
  $form['transcripts_display_settings']['transcripts_toolbox_mappings'] = array(
  	'#title' => t('Toolbox mappings'),
  	'#type' => 'textfield',
  	'#size' => 150,
  	'#default_value' => variable_get('transcripts_toolbox_mappings', 'tx|ts_content_even, mb|ts_content_morph, ge|ts_content_igt, ft|ts_content_eng, ru|ts_content_rus'),
  	'#description' => t('Enter a comma-separated list of Toolbox tier mappings, in the form toolbox_tier|transcripts_tier.'),
  	'#required' => TRUE,
  );
  $form['transcripts_display_settings']['transcripts_empty_tiers'] = array(
        '#title' => t('Include empty tiers'),
        '#type' => 'checkbox',
        '#default_value' => variable_get('transcripts_empty_tiers', TRUE),
        '#description' => t('Do you want empty tiers to be included in the transcript display? Non-included empty tiers cannot be edited.'),
  );
  $form['transcripts_display_settings']['transcripts_speaker_names'] = array(
        '#title' => t('Include speaker names'),
        '#type' => 'checkbox',
        '#default_value' => variable_get('transcripts_speaker_names', TRUE),
        '#description' => t('Do you want speaker names to be included in the transcript display? Hidden speaker names cannot be edited.'),
  );
  $profiles = transcripts_all_profiles();
  $options = array();
  foreach ($profiles as $pid => $data) {
  	$options[$pid] = "Transcript player: ".$pid;
  }
  $form['transcripts_display_settings']['transcripts_default_profile'] = array(
  	'#title' => t('Default transcript profile'),
    '#type' => 'select',
    '#options' => $options,
    '#default_value' => variable_get('transcripts_default_profile', ''),
  	'#description' => t('Select the default transcript player profile.'),
  	'#required' => TRUE,
  );
  return $form;
}

function transcripts_profile_settings() {
	$form = array();
  $form['transcripts_profiles'] = array(
    '#title' => t('Player profiles'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  
  /* existing profiles */
  $headers = array(
    array('data' => t('Operations'), 'colspan' => 2),
    t('Id'),
    t('Menu'),
    t('Tiers'),
    t('Modes'),
  );
  $rows = array();
  foreach (transcripts_all_profiles() as $pid => $data) {
    $rows[] = array('data' =>
      array(
        // Cells
        array('class' => 'operation', 'data' => l(t('edit'), 'admin/config/search/apachesolr/transcripts/' . $data['pid'], array('query' => array('destination' => $_GET['q'])))),
        array('class' => 'operation', 'data' => l(t('delete'), 'admin/config/search/apachesolr/transcripts/' . $data['pid'] . '/delete')),
        check_plain($data['pid']),
        check_plain($data['menu']),
        improved_list_allowed_values_string($data['tiers'], "<br/>"),
        implode("<br/>", array_values(array_intersect_key(transcripts_all_modes(), array_filter($data['modes'])))),
      ),
    );
  }
  $form['transcripts_profiles']['transcripts_table'] = array(
    '#theme' => 'table',
    '#header' => $headers,
    '#rows' => $rows,
  );
  
  /* add new profile */
  $actions[] = array(
    '#theme' => 'menu_local_action',
    '#link' => array('title' => t('Add new display profile'), 'href' => 'admin/config/search/apachesolr/transcripts/add', 'options' => array()),
  );
  $form['transcripts_profiles']['transcripts_actions'] = array(
    '#markup' => '<ul class="action-links">' . drupal_render($actions) . '</ul>',
  );
  return $form;
}

function transcripts_mapper_settings() {
  /* interpret id - should permissions check for PHP writing ability */
  $form = array();
  $form['transcripts_mapper'] = array(
    '#title' => t('Mapping info'),
    '#type' => 'fieldset',
    //'#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['transcripts_mapper']['transcripts_id_mapper'] = array(
  	'#title' => t('Id mapper'),
  	'#description' => t('<p>PHP code that interprets unique (node) ids as passed to URLs, and converts them to data used by the
							transcript players. Do not begin this code with <code>&lt;?php</code>. Code should end with:
							<div>
							    <code>
								    $val = array(<br/>
									&nbsp;&nbsp;"video_tag" => "HTML 5 VIDEO TAG",<br/>
									&nbsp;&nbsp;"video_url" => array(URL1, URL2, ...),<br/>
									);<br/>
								</code>
							</div>
  						</p>
  						<p>
  						  The id to be mapped by this code is contained in the variable <code>$entity_id</code>.
  						  If <code>video_url</code> is returned, then a video tag will be constructed from
  						  the supplied array. Otherwise, <code>video_tag</code> will be used.
  						</p>'),
  	'#type' => 'textarea',
  	'#rows' => 10,
    '#default_value' => variable_get('transcripts_id_mapper', ''),
  );
  return $form;
}

function transcripts_site_settings_form($form, &$form_state) {
	return system_settings_form(array_merge(
		$form,
		transcripts_solr_settings(),
		transcripts_saxon_settings(),
		transcripts_index_settings(),
		transcripts_search_settings(),
		transcripts_display_settings(),
		transcripts_profile_settings(),
		transcripts_mapper_settings()
	));
}

function transcripts_project_settings_form($form, &$form_state) {
	return system_settings_form(array_merge(
		$form,
		//transcripts_solr_settings(),
		//transcripts_saxon_settings(),
		//transcripts_index_settings(),
		transcripts_search_settings(),
		transcripts_display_settings()
		//transcripts_profile_settings(),
		//transcripts_mapper_settings()
	));
}

