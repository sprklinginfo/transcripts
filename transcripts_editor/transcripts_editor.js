(function($) {
		Drupal.behaviors.transcriptsEditor = {
			attach:
				function(context, settings) {
					var mayEdit = true;
					if (mayEdit) {
						$('.transcript-player:not(editable-processed)', context).each(function() {
							var $player = $(this);
							var pid = $player.attr('id');
							var pencilId = "pencil" + pid;
							//var clockId = "clock" + pid;
							var $input = $('<input id="' + pencilId + '" class="pencil" type="checkbox"/>');
							//var $clock = $('<input id="' + clockId + '" class="clock" type="checkbox"/>');
							
							$('<span class="control-block edit-controls"></span>')
								.appendTo($player.find('.video-controls'))
								.append($input).append('<label for="' + pencilId + '"></label>')
								;//.append($clock).append('<label for="' + clockId + '"></label>');
								
							$input.button({
								label: 'Edit transcript',
								icons: {
									primary: 'ui-icon-pencil'
								},
								text: false
							}).change(function() {
								if ($input.is(':checked')) {
									disableClickAndPlay($player);
									
									//display timecodes
									$('div[data-participant]', $player).each(function() {
										var $s = $(this);
										var begin = $s.attr('data-begin'); //what if undefined?
										var end = $s.attr('data-end'); //what if undefined?
										var tid = 't-' + $s.attr('id').substr(2);
										
										var $playwrapper = $("<div class='playwrapper'></div>").appendTo($('.info', $s));
										
										var $play = $("<button></button>");
										var $controls = $("<div class='infocontrols'></div>").appendTo($playwrapper).append($play);
										$play.button({
											//label: 'Play sentence',
											icons: {
												primary: 'ui-icon-play'
											},
											text: false
										}).click(function() {
											playOne(pid, $s);
										});
										$controls.css('visibility', 'hidden');
										
										$("<div class='timecodes'></div>").appendTo($playwrapper)
											.append($("<div class='t1'>").html(begin))
											.append($("<div class='clearfix'></div>"))
											.append($("<div class='t2'>").html(end))
											.append($("<div class='clearfix'></div>"))
											.css('visibility', 'hidden');
									});

									$('.transcript span', $player).contents().unwrap(); //remove spans from transcript
									
									$('.tier', $player).editable(
										function(value, settings) { 
											console.log(this); //<div class="tier content_bod editable active" style="">
											console.log(value); 
											console.log(settings);
											return(value); //return value is displayed after editing is complete
										},{
											type      	: 'elastic',
											placeholder	: '(EMPTY)',
											onblur    	: 'submit',
											elastic : {}
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
											console.log(value); 
											return(value); //return value is displayed after editing is complete
										},{
											type				: 'combobox',
											placeholder	: '(EMPTY)',
											data				: speakers,
											onblur			: 'submit'
										}
									);
									$('.t1,.t2', $player).editable(
										function(value, settings) {
											console.log(value);
											return(value);
										},{
											type				: 'spinner',
											onblur			: 'submit',
											spinner			: {
												min					: 0,
												places			: 3,
												defaultStep :	.01,
												largeStep		: .1
											},
										}
									);
									
									$('.timecodes form', $player).focusin(function() {
										console.log('got focus');
									});
									$('.timecodes form', $player).focusout(function() {
										console.log('lost focus');
									});
									
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
								} else {
									$('.tier', $player).editable('destroy');
									$('.speakername', $player).editable('destroy');
									
									//remove extra controls in info section
									$('.infocontrols', $player).remove();
									$('.playwrapper', $player).remove();
									enableClickAndPlay($player);
								}
							});
						}).addClass('editable-processed');
					}
				}
		}
})(jQuery);
