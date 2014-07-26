function toUnitplayer($player) {
	setPlayStop($player);
	$player.find('.mode-controls button').button('option', 'disabled', true);
	$player.find('.transcript').removeClass('scroller').addClass('unitplayer').appendTo($player.find('.v-sub'));
	$player.find('.hit-summary').appendTo($player.find('.t-column'));
	
}

function fromUnitplayer($player) {
	$player.find('.mode-controls button').button('option', 'disabled', false);
	$player.find('.transcript').removeClass('unitplayer').addClass('scroller').appendTo($player.find('.t-column'));
	$player.find('.hit-summary').appendTo($player.find('.v-sub'));
}