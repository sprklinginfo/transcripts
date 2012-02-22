(function($) {
		Drupal.behaviors.playerControls = {
			attach: function(context, settings) {
				$('.transcript-controls:not(.player-processed)', context).each(function() {
					var $controls = $(this);
					var pid = $controls.attr('data-for');
					var pidfix = '#' + pid + '-';
					var $player = $('#' + pid);
					
					$player.find('.transcript .tier').addClass('active');
          $controls.find('.tier-controls')
          	.find('input').attr('checked', true).change(
          		function()
							{
								//simulate radio button
								if ($player.data('tier-select') == 'single') {
									//turn everything off
									$controls.find('.tier-controls input').each(
										function() {
											$player.find('.transcript .' + $(this).val()).removeClass('active');
											$(this).removeAttr('checked').button('refresh');
										}
									);
									//turn selected on
									$(this).attr('checked', true).button('refresh');
								}
								$player.find('.transcript .' + $(this).val()).toggleClass('active');
								$(this).blur();
							}
            )
            .end()
            .buttonset();
            
          //hide buttons for tiers that have no data
          $controls.find('.tier-controls input').each(function() {
          	if ($player.find('.transcript .' + $(this).val()).size() == 0) {
          		var id = $(this).attr('id');
          		$('label[for='+id+']').hide();
          	}
          });
            
          $(pidfix + $player.attr('data-defaultmode')).attr('checked', true);
          $controls.find('.mode-controls').data('oldMode', $controls.find('input[name=radio-mode]:checked').val());
          $controls.find('.mode-controls')
          	.find('input').change(
							function()
							{
								var oldMode = $controls.find('.mode-controls').data('oldMode');
								var back = $(pidfix + oldMode).attr('data-back');
								if (back != '') {
									var fn = window[back];
									if(typeof fn === 'function') {
										fn($player);
									}
								}
								var newMode = $controls.find('input[name=radio-mode]:checked').val();
								var to = $(pidfix + newMode).attr('data-to');
								if (to != '') {
									var fn = window[to];
									if(typeof fn === 'function') {
										fn($player);
									}
								}
								$controls.find('.mode-controls').data('oldMode', newMode);
								$(this).blur();
							}
						)
            .end()
            .buttonset();
						
          if ($controls.is(':empty')) {
          	$controls.css({'height':'0px'});
          }
					$player.find('.previous').button({
						text: false,
						icons: {
							primary: 'ui-icon-seek-prev'
						}
					}).click(function() {
						previous(pid);
					});
					$player.find('.sameagain').button({
						text: false,
						icons: {
							primary: 'ui-icon-play'
						}
					}).click(function() {
						sameAgain(pid);
					});
					$player.find('.next').button({
						text: false,
						icons: {
							primary: 'ui-icon-seek-next'
						}
					}).click(function() {
						next(pid);
					});
					$player.find('.playmode')
						.button()
						.click(
							function() {
								if ($(this).is('.playstop')) {
									setPlayThru($player);
								}
								else {
									setPlayStop($player);
								}
							}
						);
					setPlayStop($player);
					
					/* maybe can eliminate with proper use of jquery bbq */
					//play hit
					$player.find('.play-hit').click(function() {
						playOne(pid, $('#' + $(this).parents('div.hit-container').attr('data-refid')));
					});
					$player.find('.clear-hits').click(function() {
						$player.find('.hit-summary').remove();
						$player.find('.hit').removeClass('hit');
						return false;
					});
					/*$player.find('.play-hit').button({
						text: false,
						icons: {
							primary: 'ui-icon-play'
						}
					}).click(function() {
						playOne(pid, $('#' + $(this).parents('div.hit-container').attr('data-refid')));
					});
					$player.find('.clear-hits').button({
						text: false,
						icons: {
							primary: 'ui-icon-closethick'
						}
					}).click(function() {
						$player.find('.hit-summary').remove();
						$player.find('.hit').removeClass('hit'); //removes from both div and span
						//playOne($('#' + $(this).parents('div.hit-container').attr('data-refid')));
					});*/
			})
			.addClass('player-processed');
		}
	}
	
})(jQuery);

var playstop = {
	label: "Play line and stop", 
	icons: {
		primary: "ui-icon-arrowstop-1-e"
	},
	text: false
};
var playthru = {
	label: "Play through without stopping",
	icons: {
		primary: "ui-icon-arrow-1-e"
	},
	text: false
};
					
function setPlayStop($player) {
	$player.find('.playmode').addClass('playstop').button("option", playstop);
	$player.find('.sentence-controls button').button("option", "disabled", false);
	setPlayMode($player.attr('id'), 'playstop');
}

function setPlayThru($player) {
	$player.find('.playmode').removeClass('playstop').button("option", playthru);
	$player.find('.sentence-controls button').button("option", "disabled", true);
	setPlayMode($player.attr('id'), 'playthru');
}
