(function($) {
		Drupal.behaviors.transcriptsEditor = {
			attach:
				function(context, settings) {
					var hoverPlaywrapper = false;
					var tierHolder = '&lt;Empty&gt;';
					var speakerHolder = '&lt;No name&gt;';
					$('.transcript-player', context).once('editable').each(function() {
						var $player = $(this);
						var pid = $player.attr('id');
						var data = Drupal.settings['transcripts_editor_' + pid.substring(4)];
						if (data.editable) {
							var pencilId = "pencil" + pid;
							var $input = $('<input id="' + pencilId + '" class="pencil" type="checkbox"/>');
							$('<span class="control-block edit-controls"></span>')
								.appendTo($player.find('.video-controls'))
								.append($input).append('<label for="' + pencilId + '"></label>');
								
							$input.button({
								label: 'Edit transcript',
								icons: {
									primary: 'ui-icon-pencil'
								},
								text: false
							}).change(function() {
								if ($input.is(':checked')) {
									disableClickAndPlay($player);
									if (hoverPlaywrapper) {
										$('.infocontrols', $player).css('visibility', 'hidden');
										$('.timecodes', $player).css('visibility', 'hidden');
										
										$('.playwrapper', $player).hoverIntent(
											function() {
												$('.infocontrols', this).css('visibility', 'visible');
												$('.timecodes', this).css('visibility', 'visible');
											},
											function() {
												$('.timecodes input', this).blur();
												$('.infocontrols', this).css('visibility', 'hidden');
												$('.timecodes', this).css('visibility', 'hidden');
											}
										);
									}
									$('.playwrapper', $player).show();
									$('.transcript', $player).addClass('editing');
									$('.transcript span', $player).contents().unwrap(); //remove spans from transcript
									$('.tier', $player).editable(
										function(value, settings) {
											/*console.log(this); //<div class="tier content_bod editable active" style="">
											console.log(value); 
											console.log(settings);*/
											return(value); //return value is displayed after editing is complete
										},{
											type: 'elastic',
											placeholder: tierHolder,
											onblur: 'submit',
											elastic: {}
										}
									);	
									var dupes = {};
									var speakers = [];
									$('.speakername', $player).each(function() {
										var speaker = $(this).text();
										if (!dupes[speaker]) {
											dupes[speaker] = true;
											speakers[speaker] = speaker;
										}
									});
									$('.speakername', $player).editable(
										function(value, settings) {
											var $s = $(this).parents('div[data-participant]');
											if ($s.attr('data-participant') != value) { //changed
												$s.attr('data-participant', value);
											}
											return(value); //return value is displayed after editing is complete
										},{
											type: 'combobox',
											placeholder: speakerHolder,
											data: speakers,
											onblur: 'submit'
										}
									);
									$('.t1,.t2', $player).editable(
										function(value, settings) {
											var t = $(this).hasClass('t1') ? 'data-begin' : 'data-end';
											var $s = $(this).parents('div[' + t + ']');
											if ($s.attr(t) != value) { //changed
												$s.attr(t, value);
											}
											return(value);
										},{
											type: 'spinner',
											onblur: //submit without delay
												function(value, settings) {
													$('form', this).submit();
												},
											spinner: {
												min: 0,
												places: 3,
												defaultStep: .01,
												largeStep: .1
											}
										}
									);
								} else {  
									/* remove placeholders, replace is here because of IE */
									$('.tier', $player).each(function() {
										if ($(this).html().toLowerCase().replace(/(;|")/g, '') ==
											tierHolder.toLowerCase().replace(/(;|")/g, '')) {
												$(this).html('');
										}
									});
									$('.speakername', $player).each(function() {
										if ($(this).html().toLowerCase().replace(/(;|")/g, '') ==
											speakerHolder.toLowerCase().replace(/(;|")/g, '')) {
												$(this).html('');
										}
									});
									$('.tier', $player).editable('destroy');
									$('.speakername', $player).editable('destroy');
									
									//hide info controls
									$('.playwrapper', $player).hide();
									$('.infocontrols', $player).css('visibility', 'visible');
									$('.playwrapper', $player).css('visibility', 'visible');
									
									$('.transcript', $player).removeClass('editing');
									enableClickAndPlay($player);
								}
							});
						}
					});
				}
		}
})(jQuery);
