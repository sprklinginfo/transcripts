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
							var timer;
							var autosave = function autosave() {
								if ($('div[data-changed=true]', $player).size() > 0) {
									var updates = new Array(); 
									var deletes = new Array();
									
									$('div[data-changed=true]', $player)
										.each(function() {
												if ($(this).is('.deleted')) {
												    var tcu = {};
												    tcu.tcuid = $(this).attr('id');
												    deletes.push(tcu);
												    $(this).removeAttr('data-changed');
												}
												else {
												    var stillChanging = false;
												    $('.t1, .t2, .speakername, *[data-tier]', this).each(function() {
												            if (this.editing) {
												                stillChanging = true;
												                return false;
												            }
												    });
												    
												    if (!stillChanging) {
                                                        var tcu = {};
                                                        tcu.tcuid = $(this).attr('id');
                                                        tcu.speaker = $(this).attr('data-participant');
                                                        tcu.start = $(this).attr('data-begin');
                                                        tcu.end = $(this).attr('data-end');
                                                        
                                                        tcu.tiers = {};
                                                        $('*[data-tier]', this).each(function() {
                                                                if (!this.editing) { //just in case a sudden change?
                                                                    tcu.tiers[$(this).attr('data-tier')] = $(this).html();
                                                                }
                                                        });
                                                        
                                                        updates.push(tcu);
                                                        $(this).removeAttr('data-changed');
													}
												}
										});
										
										if (updates.length > 0 || deletes.length > 0) {
                                            $.ajax({
                                                    type: 'POST',
                                                    url: Drupal.settings.basePath + 'tcu/update',
                                                    data: {
                                                        update: updates,
                                                        delete: deletes
                                                    },
                                                    success: function(data) {
                                                    },
                                                    failure: function(msg) {
                                                        alert(msg);
                                                    }
                                            });
										}
								}
							}
							
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
									
									var editableTier = function() {
										$(this)
												.editable(
													function(value, settings) {
														$(this).parents('div[data-begin]').attr('data-changed', true); //trigger autosave
														return(value); //return value is displayed after editing is complete
													},{
														type: 'elastic',
														placeholder: tierHolder,
														onblur: 'submit',
														elastic: {}
													}
												)
												.click();
									};
									$('.tier', $player).one('click', editableTier);
									
									var dupes = {};
									var speakers = [];
									$('.speakername', $player).each(function() {
										var speaker = $(this).text();
										if (!dupes[speaker]) {
											dupes[speaker] = true;
											speakers[speaker] = speaker;
										}
									});
									
									var editableSpeaker = function() {
										var $speakername = $(this);
										$speakername.editable(
													function(value, settings) {
														var $s = $speakername.parents('div[data-participant]');
														var oldValue = $s.attr('data-participant');
														if (oldValue != value) { //changed
															$s.attr({'data-participant': value, 'data-changed': true});
														}
														return(value); //return value is displayed after editing is complete
													},{
														type: 'combobox',
														placeholder: speakerHolder,
														data: speakers,
														onblur: 'submit',
														combobox: {
															editOption: function($option, oldValue) {
																var value = $option.attr('value');
																delete speakers[oldValue];
																speakers[value] = value;
																//change all speakers
																$('div[data-participant=' + oldValue + ']', $player)
																	.attr({'data-participant': value, 'data-changed': true})
																	.find('.speakername')
																	.not($speakername)
																	.html(value);
															},
															newOption: function($option, value) {
																speakers[value] = value; //add new speaker to list
															}
														}
													}
												)
												.click();
									};
									$('.speakername', $player).one('click', editableSpeaker);

									var t1,t2;
									$('.speakername', $player)
										.delegate('input', {
											'focus': function() {
												if (t1) {
													clearTimeout(t1);
												}
												if (t2) {
													clearTimeout(t2);
												}
											},
											'blur': function() {
													var select = $(this).parents('form').find('select.combobox');
													t1 = setTimeout(
														function() {
															select.change();
														},200);
													$(this).autocomplete("widget")
														.focusin(function() {
															clearTimeout(t1);
														})
														.focusout(function() {
															t2 = setTimeout(
																function() {
																	select.change();
																},200);
															});
											}
										});
									
									var editableTime = function() {
										$(this)
											.editable(
												function(value, settings) {
													var t = $(this).hasClass('t1') ? 'data-begin' : 'data-end';
													var $s = $(this).parents('div[' + t + ']');
													if ($s.attr(t) != value) { //changed
														$s.attr(t, value).attr('data-changed', true);
														recomputeSentenceStack($player);
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
											)
											.click();
									};
									$('.t1,.t2', $player).one('click', editableTime);
									
									var msg = "This sentence will be deleted from the transcript. Are you sure?";
									
									var attachDelete = function($anchor) {
										$anchor
											.hover(
												function() {
													$('span',this).addClass('ui-state-hover');
												},
												function() {
													$('span',this).removeClass('ui-state-hover');
												}
											)
											.focus(function() {
												$('span',this).addClass('ui-state-focus');
											})
											.blur(function() {
												$('span',this).removeClass('ui-state-focus');
											})
											.click(function(event) {
												$(this).focus(); //not consistent across browsers
												var $s = $(this).parents('div[data-begin]'); //get sentence
												$('<div></div>')
													.html('<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;">Alert</span> ' + msg)
													.dialog({
														dialogClass:'delete-dialog',
														title:'Delete sentence?',
														resizable: false,
														height:120,
														modal: true,
														closeOnEscape:false,
														buttons: {
															"Yes": function() {
																$s.hide('blind',500)
																	.addClass('deleted')
																	.attr('data-changed', true)
																	.removeAttr('data-starts-index')
																	.find('.delete-wrapper').hide()
																	.find('.ui-icon').removeClass('ui-state-focus');
																
																$(this).dialog('close');
																recomputeSentenceStack($player);
															},
															"No": function() {
																$('.delete-wrapper .ui-icon',$s).removeClass('ui-state-focus');
																$(this).dialog('close');
															}
														}
													});
												return false;
											});
									};
									
									var k=0;
									
									var attachInsert = function($anchor) {
										$anchor
											.hover(
												function() {
													$('span',this).addClass('ui-state-hover');
													$(this).parents('div[data-begin]')
														.find('.speakername form')
														.submit(); //submit form if cloned while editing speaker name
												},
												function() {
													$('span',this).removeClass('ui-state-hover');
												}
											)
											.click(function(event) {
												$(this).focus(); //not consistent across browsers
												var $s = $(this).parents('div[data-begin]'); //get sentence
												
												var id = $s.is('.inserted') ? 
														$s.attr('id').substring(0,$s.attr('id').lastIndexOf('_')+1) + k :
														$s.attr('id') + '_' + k;
    										k++;
    										
												var $s2 = $s.clone(false)
													.addClass('inserted')
													.attr('id',id)
													.attr('data-begin', $s.attr('data-end'))
													.attr('data-end', $s.attr('data-end'))
													.find('.t1,.t2').html($s.attr('data-end')).end() //set both times to t2
													.find('.tier').empty().end() //don't copy tier data
													.css('display','none') //show with effect
													.insertAfter($s)
													.attr('data-changed', true); //trigger autosave
															
												recomputeSentenceStack($player);
												
												attachDelete($s2.find('a.s-delete'));
												attachInsert($s2.find('a.s-insert'));
												
												$('.tier',$s2).one('click', editableTier);
												$('.speakername', $s2).one('click', editableSpeaker);
												$('.t1,.t2',$s2).one('click', editableTime);
												$('.infocontrols button',$s2).click(function() {
													playOne(pid, $s2);
												});
												
												$s2.show('blind',500);
												
												return false;
											});
									};
													
									$('div[data-begin]', $player)
										.each(
											function(i) {
												var $del = $('<a href="#"></a>')
													.addClass('s-delete')
													.attr('role', 'button')
													.attr('title', 'Delete sentence')
													.append('<span class="ui-icon ui-icon-close ui-state-default ui-corner-all">Delete</span>');
												
												var $ins = $('<a href="#"></a>')
													.addClass('s-insert')
													.attr('role','button')
													.attr('title','Insert sentence')
													.append('<span class="ui-icon ui-icon-plus ui-state-default ui-corner-all">Insert</span>');
													
												attachDelete($del);
												attachInsert($ins);
										
												$('<div class="delete-wrapper">').append($del).appendTo(this);
												var cls = (i%3 == 0) ? 'show-icon' : 'hide-icon';
												$(this).append('<div class="clearfix"></div>');
												$('<div class="insert-wrapper ' + cls + '">')
													.append($ins)
													.appendTo(this);
											}
									  );
									  
									$('.hide-icon',$player)
										.animate({opacity:0},2500)
										.hover(
											function() {
												$(this).css('opacity',1);
											},
											function() {
												$(this).css('opacity',0);
											}
										);
										
									timer = setInterval(autosave, 10000);
								} else {
									clearInterval(timer);
									autosave();
									
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
									
									//remove delete and insert buttons
									$('.delete-wrapper', $player).remove();
									$('.insert-wrapper', $player).remove();
									
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
