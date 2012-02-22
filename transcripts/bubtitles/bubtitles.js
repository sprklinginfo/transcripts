var cache = new Array();
var bPos= new Array();
var backupPos = new Array();
var saveSettings = new Array();

var bubbletypes = [
	'.triangle-border.bottom-right', '.triangle-border.bottom-left',
	'.triangle-border.left-bottom', '.triangle-border.left-top',
	'.triangle-border.top-left', '.triangle-border.top-right',
	'.triangle-border.right-top', '.triangle-border.right-bottom'
];

var radial_padding = 25;
var extra = 40; //padding*2 + margin*2

function listen(pid, $id, event) {
	if (event == 'startPlay') {
		$id.parent().addClass('speaking');
	}
	else if (event == 'endPlay') {
		$id.parent().removeClass('speaking');
	}
}

function toBubbler($player) {
	var pid = $player.attr('id');
	var shortpid = pid.substr(4); //remove pid-
	
	//cache time-sorted list of sentences for fromBubbler
	cache[pid] = new Array();
	var $participants = {};
	$player.find('div[data-begin]').each(function(index) {
		$timedUnit = jQuery(this);
		var name = $timedUnit.attr('data-participant');
		if (!$participants[name]) {
			$participants[name] = name;
			jQuery("<div class='participant' data-participant='" + name + "'>")
				.appendTo($player.find('.transcript'))
				.append("<div class='circle'></div><div class='bubble' data-bid=''></div>");
		}
		$player.find('div.participant[data-participant=' + name + '] div.bubble').append($timedUnit);
		cache[pid][index] = $timedUnit;
	});
	
	//change to single-select tiers and select first selected tier
	$player.data('tier-select', 'single');
	var selected = true;
	$tiercontrols = jQuery('.transcript-controls[data-for=' + pid + '] .tier-controls');
	$tiercontrols.find('input').each(function() {
			if (jQuery(this).is(':checked')) {
				jQuery(this).change();
				return false; //select first checked tier
			}
	});
	if ($tiercontrols.find('input:checked').length == 0) {
		$tiercontrols.find('input:eq(0)').change(); //otherwise select first tier
	}

	addPlayListener(pid, listen);
	
	//set play mode to playStop and disable playThru 
	setPlayStop($player);
	$player.find('.mode-controls button').button("option", "disabled", true);
	
	$player.find('.transcript').removeClass('scroller').addClass('bubbler').appendTo($player.find('.v-column'));
  if (bPos[pid] == undefined) {
  	jQuery('.circle', $player).live('click', 
  		function() {
				if (jQuery(this).hasClass('noclick')) {
					jQuery(this).removeClass('noclick');
				}
				else {
					jQuery(this).siblings('.bubble').toggle();
				}
			}
		);
		$player.find('.play-hit').button({
			text: false,
			icons: {
				primary: 'ui-icon-play'
			}
		}).click(function() {
			playOne(pid, jQuery('#' + jQuery(this).parents('div.hit-container').attr('data-refid')));
		});
				var data = Drupal.settings['speechBubbles_' + shortpid];
				positionBubbles($player, data);
				saveSettings[pid] = data.saveSettings;
				if (data.saveSettings) {
					var $bubbleControls = jQuery('<span class="bubble-controls"></span>');
					//var $bubbleControls = jQuery('<span class="bubble-controls">Bubbles: </span>');
					var $editBubbles = jQuery('<button class="edit-bubbles"></button>');
					var $saveBubbles = jQuery('<button class="save-bubbles"></button>');
					var $cancelBubbles = jQuery('<button class="cancel-bubbles"></button>');
					$editBubbles.button({
						label: "Edit bubble settings",
						icons: {
							primary: 'ui-icon-comment'
						},
						text: false
					}).click(function() {
						setCanSave($player);
						backupPos[pid] = bPos[pid];
						$bubbleControls.addClass('editing');
						$player.find('.bubble').addClass('editing');
					});
					$cancelBubbles.button({
						label: "Cancel changes",
						icons: {
							primary: 'ui-icon-cancel'
						},
						text: false
					}).click(function() {
						bPos[pid] = backupPos[pid];
						bPositionBubbles($player);
						cancelCanSave($player);
						$bubbleControls.removeClass('editing');
						$player.find('.bubble').removeClass('editing');
					});
					$saveBubbles.button({
						label: "Save changes",
						icons: {
							primary: 'ui-icon-check'
						},
						text: false
					}).click(function() {
						storePositions($player);
						var bubblep = [];
						var k=0;
						for (var name in bPos[pid]) {
							bubblep[k] = {
								bid:bPos[pid][name].bid,
								name:name,
								angle:bPos[pid][name].angle,
								center_x:bPos[pid][name].center_x,
								center_y:bPos[pid][name].center_y,
								radius:bPos[pid][name].radius,
								display:bPos[pid][name].display,
								height:bPos[pid][name].height,
								width:bPos[pid][name].width,
								style:bPos[pid][name].style
							};
							k++;
						}
						jQuery("body").css("cursor", "progress");
						$player.find('.bubble-controls button').button("option", "disabled", true);
						
						//if failure, should perhaps go back to backupPos settings
						jQuery.post('/?q=bubble-positions/' + shortpid + '/set', jQuery.param({settings: {bubbles:bubblep}}),
							function(data) {
								jQuery("body").css("cursor", "auto");
								$player.find('.bubble-controls button').button("option", "disabled", false);
								positionBubbles($player, data); //technically only need to iterate through bids and assign to divs				
								cancelCanSave($player);
								$bubbleControls.removeClass('editing');
								$player.find('.bubble').removeClass('editing');
							}
						);
					});
					$bubbleControls.appendTo($player.find('.video-controls'))
						.append($editBubbles)
						.append($saveBubbles)
						.append($cancelBubbles);
				}
  }
  else { //should really use positionBubbles here as well
  	bPositionBubbles($player);
  }
}

function cancelCanSave($player) {
	$player.find('div.participant').each(
		function() {
			var $circle = jQuery('.circle', this);
			var $bubble = jQuery('.bubble', this);
			$circle.draggable('destroy').resizable('destroy').css('border', 'none');
			$bubble.draggable('destroy').resizable('destroy');
		}
	);
	$player.find('v-column').draggable('destroy').unbind('mousemove');
}

function setCanSave($player) {
	$player.find('div.participant').each(
		function() {
			var $circle = jQuery('.circle', this);
			var $bubble = jQuery('.bubble', this);
			$circle
				.draggable({
					start: function(event, ui) {
							$circle.addClass('noclick');
							var circle = {
									radius: $circle.width() / 2,
									centerX: $circle.position().left + $circle.width() / 2,
									centerY: $circle.position().top + $circle.height() / 2
							};
					},
					drag: function(event, ui) {
							var circle = {
									radius: $circle.width() / 2,
									centerX: ui.position.left + $circle.width() / 2,
									centerY: ui.position.top + $circle.height() / 2
							};
							var angle = $bubble.data('angle');
							positionBubble($bubble, null, circle, angle);
					}
				})
				.resizable({
					handles: "n,ne,e,se,s,sw,w,nw",
					aspectRatio: 1,
					start: function(event, ui) {
							$circle.addClass('noclick');
							var circle = {
									radius: ui.originalSize.width / 2,
									centerX: ui.originalPosition.left + ui.originalSize.width / 2,
									centerY: ui.originalPosition.top + ui.originalSize.height / 2
							};
					},
					resize: function(event, ui) {
							var angle = $bubble.data('angle');
							var circle = {
									radius: ui.size.width / 2,
									centerX: ui.position.left + ui.size.width / 2,
									centerY: ui.position.top + ui.size.height / 2
							};
							positionBubble($bubble, null, circle, angle);
					}
				})
				.css('border', '3px #a72525 dashed') //was 2px
				.find('.ui-resizable-se')
				.hide();
				
			$bubble
				.resizable({
					handles: "n,ne,e,se,s,sw,w,nw",
					start: function(event, ui) {
							$bubble.data('circle', {
									radius: $circle.width() / 2,
									centerX: $circle.position().left + $circle.width() / 2,
									centerY: $circle.position().top + $circle.height() / 2
							});
					},
					resize: function(event, ui) {
							positionBubble($bubble, ui.position, $bubble.data('circle'), $bubble.data('angle'));
					}
				})
				.draggable({
					start: function(event, ui) {
							$bubble.data('circle', {
									radius: $circle.width() / 2,
									centerX: $circle.position().left + $circle.width() / 2,
									centerY: $circle.position().top + $circle.height() / 2
							});
					},
					drag: function(event, ui) {
							var circle = $bubble.data('circle')
							var offsetX = $circle.offset().left + circle.radius;
							var offsetY = $circle.offset().top + circle.radius;
							var angle = Math.atan2(event.pageX - offsetX, event.pageY - offsetY);
							positionBubble($bubble, ui.position, circle, angle);
					}
				});
		}
	);
  $player.find('.v-column')
  	.draggable({handle: 'video'})
    .mousemove(function (e) {
    	var yAxis = e.pageY - $player.find('video').offset().top;
      if (yAxis > 260) { //draggable should not interfere with video controls (height = 300)
        // http://bugs.jqueryui.com/ticket/5974
        jQuery(this).draggable('option', 'disabled', true).removeClass('ui-state-disabled');
      } else {
        jQuery(this).draggable('option', {disabled: false, cursor: 'move'});
      }
  });
}

function setPoint($bubble, newPoint) {
    var oldPoint = $bubble.data('point') ? $bubble.data('point') : '';
    if (oldPoint != newPoint) {
        $bubble.removeClass(oldPoint).addClass(newPoint);
        $bubble.data('point', newPoint);
    }
}

function positionBubble($bubble, pos, circle, angle) {
    var top = circle.centerY + Math.cos(angle) * (circle.radius + radial_padding);
    var left = circle.centerX + Math.sin(angle) * (circle.radius + radial_padding);
    var point;
    if (Math.abs(angle) >= Math.PI*3/4) { //top
        var x = angle > 0 ? angle - Math.PI*3/4 : Math.PI*1/4 + Math.PI - Math.abs(angle);
        left -= parseInt(($bubble.width()+extra) * x * 2 / Math.PI);
        top -= $bubble.height() + extra;
        point = angle > 0 ? "bottom-left" : "bottom-right";
    }
    else if (angle <= Math.PI*3/4 && angle >= Math.PI*1/4) { //right
        var x = angle - Math.PI*1/4;
        top -= parseInt(($bubble.height()+extra) * x * 2 / Math.PI);
        point = angle > Math.PI/2 ? "left-bottom" : "left-top";
    }
    else if (Math.abs(angle) <= Math.PI*1/4) { //bottom
        var x = angle > 0 ? Math.PI*1/4 - angle : Math.PI*1/4 + Math.abs(angle);
        left -= parseInt(($bubble.width() + extra) * x * 2 / Math.PI);
        point = angle > 0 ? "top-left" : "top-right";
    }
    else if (angle <= -Math.PI*1/4 && angle >= -Math.PI*3/4) { //left
        var x = Math.abs(angle) - Math.PI*1/4;
        top -= parseInt(($bubble.height()+extra) * x * 2 / Math.PI);
        left -= $bubble.width() + extra; 
        point = angle < -Math.PI/2 ? "right-bottom" : "right-top";
    }
    if (pos == null)  {
        $bubble.css({
            top: top+'px',
            left: left+'px'
        });
    }
    else {
        pos.top = top;
        pos.left = left;
    }
    setPoint($bubble, point);
    $bubble.data('angle', angle);
}

function positionBubbles($player, data) {
	var min_top = 0;
	var min_lef = 0;
	if (data.bubbles == undefined) { //default bubble positions
		$player.find('div.participant').each(function(index) {
			//assuming 400x300 video
			var $circle = jQuery('.circle', this);
			var $bubble = jQuery('.bubble', this);
			var left = 700;
			var top = 15 + index * 110 + 'px';
			$circle.css({
					left:left, 
					top:top, 
					height:'75px', 
					width:'75px',
					cursor:'pointer'
				});
			$bubble.css({display:'block',visibility:'hidden',width:'200px',height:'65px'}).addClass('triangle-border');
			//$bubble.css({width:'200px',height:'65px'}).addClass('triangle-border');
			var circle = {
					radius: $circle.width() / 2,
					centerX: $circle.position().left + $circle.width() / 2,
					centerY: $circle.position().top + $circle.height() / 2
			};
			positionBubble($bubble, null, circle, -Math.PI/2);
			var top = $bubble.position().top;
			var lef = $bubble.position().left;
			min_top = top < min_top ? top : min_top;
			min_lef = lef < min_lef ? lef : min_lef;
		});
	}
	else {
		jQuery.each(data.bubbles,
			function(index, settings) {
				var $participant = $player.find('div.participant[data-participant="' + settings.name + '"]');
				//if returning subset of sentences, some participants may not be represented in output
				if ($participant.length != 0) {
					var $circle = jQuery('.circle', $participant);
					var $bubble = jQuery('.bubble', $participant);
					$circle.css({
							top:settings.center_y - settings.radius, 
							left:settings.center_x - settings.radius, 
							height:settings.radius*2,
							width:settings.radius*2,
							cursor:'pointer'
						});
					$bubble.css({
							display:'block',
							visibility:'hidden',
							height:settings.height,
							width:settings.width
						})
						.addClass(settings.style)
						.attr('data-bid', settings.bid);
					if (settings.display == 'n') $bubble.hide();
					var circle = {
							radius: $circle.width() / 2,
							centerX: $circle.position().left + $circle.width() / 2,
							centerY: $circle.position().top + $circle.height() / 2
					};
					positionBubble($bubble, null, circle, settings.angle);
					var top = $bubble.position().top;
					var lef = $bubble.position().left;
					min_top = top < min_top ? top : min_top;
					min_lef = lef < min_lef ? lef : min_lef;
				}
			}
		);
	}
	$player.find('.v-column').css({top:-min_top+50+'px',left:-min_lef+'px'});
	$player.find('.t-column').css('height', ($player.find('.t-column').height() - min_top)+'px');
	$player.find('div.participant .bubble').css({display:'',visibility:''});
	storePositions($player);
}

function bPositionBubbles($player) {
	var pid = $player.attr('id');
	var min_top = 0;
	var min_lef = 0;  	
  for (var name in bPos[pid]) {
  	var pos = bPos[pid][name];
  	var $participant = $player.find('div.participant[data-participant="' + name + '"]');
  	var $circle = $participant.find('.circle');
  	var $bubble = $participant.find('.bubble');
  	$circle.css({top:pos.center_y - pos.radius+'px', left:pos.center_x - pos.radius+'px', height:pos.radius*2+'px', width:pos.radius*2+'px',cursor:'pointer'});
    $bubble.css({display:'block',visibility:'hidden',height:pos.height+'px',width:pos.width+'px'})
     	.addClass(pos.style)
     	.attr('data-bid', pos.bid);
    if (pos.display == 'n') $bubble.hide();
		var circle = {
			radius: pos.radius,
				centerX: pos.center_x,
				centerY: pos.center_y
		};
		positionBubble($bubble, null, circle, pos.angle);
		var top = $bubble.position().top;
		var lef = $bubble.position().left;
		min_top = top < min_top ? top : min_top;
		min_lef = lef < min_lef ? lef : min_lef;
  }
  $player.find('.v-column').css({top:-min_top+50+'px',left:-min_lef+'px'});
  $player.find('.t-column').css('height', ($player.find('.t-column').height() - min_top)+'px');
  $player.find('div.participant .bubble').css({display:'',visibility:''});
  if (saveSettings[pid]) {
  	$player.find('.bubble-controls').show();
  }
}
    
function storePositions($player) {
	var pid = $player.attr('id');
	if (bPos[pid] == undefined) {
		bPos[pid] = new Array();
	}
	$player.find('div.participant').each(
		function() {
			var $p = jQuery(this);
			var name = $p.attr('data-participant');
			if (bPos[pid][name] == undefined) {
				bPos[pid][name] = {};
			}
			var $bubble = jQuery('.bubble', this);
			var $circle = jQuery('.circle', this);
			bPos[pid][name].bid = $bubble.attr('data-bid');
			bPos[pid][name].angle = $bubble.data('angle');
			bPos[pid][name].center_x = $circle.position().left + $circle.width() / 2;
			bPos[pid][name].center_y = $circle.position().top + $circle.height() / 2;
			bPos[pid][name].radius = $circle.width() / 2;
			bPos[pid][name].display = $bubble.is(':visible') ? 'y' : 'n';
			bPos[pid][name].height = $bubble.height();
			bPos[pid][name].width = $bubble.width();
			bPos[pid][name].style = "triangle-border"; //EDGE fix
		}
  );
}

function fromBubbler($player) {
	$player.data('tier-select', 'multiple');
	var pid = $player.attr('id');
	storePositions($player);
  for (var i=0; i<cache[pid].length; i++) {
    $player.find('.transcript').append(cache[pid][i]);
  }
  cancelCanSave($player);
  $player.find('.bubble-controls').removeClass('editing');
  $player.find('div.participant').remove();
  $player.find('.transcript').removeClass('bubbler').addClass('scroller').appendTo($player.find('.t-column'));
  
  removePlayListener(pid, listen);
  
  //revert to old sizes and positions
	$player.find('.t-column').css('height', ($player.find('.t-column').height() - $player.find('.v-column').position().top)+'px');
  $player.find('.v-column').css({top:'0px',left:'0px'}).draggable('destroy');
	$player.find('.mode-controls button').button("option", "disabled", false);
}
