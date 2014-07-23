<?php
// $Id$


function transcripts_already_indexed($module, $type, $fid, $id) {
	$result = db_select('transcripts_transcript', 'tr')
		->fields('tr', array('trid'))
		->condition('tr.module', $module, '=')
		->condition('tr.type', $type, '=')
		->condition('tr.fid', $fid, '=')
		->condition('tr.id', $id, '=')
		->execute();
		
	return $result->rowCount() == 0 ? FALSE : TRUE;
}

function transcripts_remove_transcript($module, $type, $id) {
	$trids = $db_select('transcripts_transcript', 'tr')
		->fields('tr', array('trid'))
		->condition('module', $module, '=')
		->condition('type', $type, '=')
		->condition('id', $id, '=')
		->execute();
		
	if (count($trids) > 0) {
		$tcuids = db_select('tcu', 't') 
			->fields('t', array('tcuid'))
			->condition('trid', $trids, 'IN')
			->execute()
			->fetchCol();
			
		if (count($tcuids) > 0) {
			tcu_delete_multiple($tcuids);
		}
		
		db_delete('transcripts_transcript')
			->condition('trid', $trids, 'IN')
			->execute();
	}
	
}

function transcripts_add_transcript($module, $type, $fid, $id, $tcus) {
    foreach ($tcus['tcu'] as $tcu) {
        $insert = tcu_create(
            array(
			    'entity_id' => $id,
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
			
	db_insert('transcripts_transcript')
	    ->fields(array(
			'module' => $module,
			'type' => $type,
	        'fid' => $fid,
			'id' => $id,
			'status' => 1,
		))
		->execute();
}
