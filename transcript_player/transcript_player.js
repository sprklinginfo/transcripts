var one = [];
var stillStopped = [];
var playMode = [];
var playSentence = [];
var playIndex = [];
var starts = [];
var ends = [];
var startPointer = [];
var lastNow = [];
var playListeners = [];
var sweetSpot = [];
var psnSweet = [];


(function($) {
		Drupal.behaviors.transcriptPlayer = {
			attach: function(context, settings) {
				$('.transcript-player', context).once('player').each(function() {
					var $player = $(this);
					var pid = $player.attr('id');
					
					sweetSpot[pid] = 0;
					psnSweet[pid] = false;
					playSentence[pid] = 0; //timeout for playing single sentence
					playIndex[pid] = 0;
					startPointer[pid] = 0;
					lastNow[pid] = 0;
					playListeners[pid] = [];
					
					starts[pid] = $player.find('div[data-begin]').map(function(element, index) {
						var o = {};
						o.$item = $(this);
						o.begin = $(this).attr('data-begin');
						o.end = $(this).attr('data-end');
						return o;                    
					}).toArray().sort(function(a,b) {
						return a.begin - b.begin;
					});
					for (var i=0; i<starts[pid].length; i++) {
						starts[pid][i].$item.attr('data-starts-index', i);
					}
					ends[pid] = $player.find('div[data-end]').map(function(element, index) {
						var o = {};
						o.$item = $(this);
						o.begin = $(this).attr('data-begin');
						o.end = $(this).attr('data-end');
						return o; 
					}).toArray().sort(function(a,b) {
						return a.end - b.end;
					});
					enableClickAndPlay($player);
					setPlayMode(pid, 'playstop');
					attachListeners($player);
					
					if ($player.find('.transcript').hasClass('scroller')) {
						var fn = window[$player.attr('data-tofunction')];
						if(typeof fn === 'function') {
							fn($player);
						}
					}
					var hash = $.param.fragment();
					if (hash != '') {
						var jump = '#s-' + pid.substring(4) + '-' + hash;
						jumpPlay(pid, $(jump));
					}
				});
			}
		}
})(jQuery);

function enableClickAndPlay($player) {
	var pid = $player.attr('id');
	$player.delegate('.transcript.scroller *[data-begin]', 'mouseover', function() {
  	jQuery(this).css('cursor', 'pointer');
  });
	$player.delegate('.transcript.scroller *[data-begin]', 'click', function() {
  	playOne(pid, jQuery(this));
  });
}

function disableClickAndPlay($player) {
	$player.undelegate('.transcript.scroller *[data-begin]');
}

function attachListeners($player) {
	var pid = $player.attr('id');
	if ($player.find('video,audio').size() > 0) { // && video != null) { //maybe not right
		var vid = $player.find('video,audio').attr('data-for', pid)[0];
		vid.addEventListener('play', playPause, false);
		vid.addEventListener('pause', playPause, false);
		vid.addEventListener('timeupdate', timeUpdated, false);
	}
}

// HTML 5 event listeners

function timeUpdated(e) {
	var vid = e.target;
  var now = vid.currentTime;
  var pid = vid.getAttribute('data-for');
  var $player = jQuery('#' + pid);

  //if playmode=playstop, then don't keep scrolling when you stop
  if (!vid.paused && one[pid] != null && now > one[pid].attr('data-end')) {
  	vid.pause();
  	now = vid.currentTime;
  	lastNow[pid] = now;
  }

  //clean highlights and scroll
  if (!vid.paused || Math.abs(lastNow[pid] - now) > .2) {
  //if (lastNow[pid] != now) {
		$player.find('.playing').each(function() {
			if (now < jQuery(this).attr('data-begin') || now > jQuery(this).attr('data-end')) {
				endPlay(pid, jQuery(this));
			}
		});
		if (now < lastNow[pid]) {
			startPointer[pid] = 0; //go back to start
			playIndex[pid] = 0;
		}
		while (now > starts[pid][startPointer[pid]]['begin']) {
			if (now < starts[pid][startPointer[pid]]['end']) {
				playIndex[pid] = startPointer[pid];
				startPlay(pid, starts[pid][startPointer[pid]].$item);
			}
			startPointer[pid]++;
		}
		lastNow[pid] = now;
  }
}

function playPause(e) {
	var vid = e.target;
	if (!vid.paused) { //if playing
		var now = vid.currentTime;
		var pid = vid.getAttribute('data-for');
		if (one[pid] != null && (now < parseFloat(one[pid].attr('data-begin'))-.1 || now > parseFloat(one[pid].attr('data-end'))+.1)) {
			one[pid] = null;
		}
	}
}

// mode control
function setPlayMode(pid, mode) {
	var $player = jQuery('#' + pid);
	playMode[pid] = mode;
	one[pid] = null; //especially when switching to playthru
}

function getPlayMode(pid) {
	return playMode[pid];
}

// play methods

function playOne(pid, $item, resetSweet) {
	resetSweet = typeof resetSweet !== 'undefined' ? resetSweet : true;
	var vid = jQuery('#' + pid).find('video,audio')[0];
  if ($item.attr('data-end') - $item.attr('data-begin') > 0) {
  	if (playMode[pid] == 'playstop') {
  		one[pid] = $item;
  	}
  	var $player = jQuery('#' + pid);
  	if ($player.find('.transcript.scroller').size() == 1) {
  		endAll(pid);
  		if (resetSweet) {
  			sweetSpot[pid] = $item.position().top;
  		}
  		
  	}
  	playIndex[pid] = parseInt($item.attr('data-starts-index'));
  	vid.currentTime = $item.attr('data-begin');
    if (vid.paused) vid.play();
  }
}

function addPlayListener(pid, func) {
	if (jQuery.inArray(func, playListeners[pid]) == -1) {
		playListeners[pid].push(func);
	}
}

function removePlayListener(pid, func) {
	playListeners[pid].splice(jQuery.inArray(func, playListeners[pid]), 1);
}

function startPlay(pid, $id) {
  $id.addClass('playing'); //sentence
  var $player = jQuery('#' + pid);
  $player.find('*[data-refid=' + $id.attr('id') + ']').addClass('playing'); //hit result
  for (var i=0; i<playListeners[pid].length; i++) {
  	var func = playListeners[pid][i];
  	func(pid, $id, 'startPlay');
  }
  var $scroller = $player.find('.transcript.scroller');
  if ($scroller.size() == 1) {
  	var idTop = $id.position().top;
  	
  	//sentence out of view above
  	if (idTop < 0 && sweetSpot[pid] < 0) {
  		sweetSpot[pid] = 0;
  		$player.find('.transcript').scrollTo($id);
  	}
  	
  	//sentence above scroll sweet spot
  	else if (idTop < 0 || idTop < sweetSpot[pid]) {
  		$player.find('.transcript').scrollTo('-=' + (sweetSpot[pid]-idTop), {axis: 'y'});
  	}
  	//sentence below scroll sweet spot
  	else {
  		$player.find('.transcript').scrollTo('+=' + (idTop-sweetSpot[pid]), {axis: 'y'});
  		
  		//sentence out of view below
  		if ($id.position().top > $scroller.height()-$id.height()) {
  			$player.find('.transcript').scrollTo($id);
  		}
  	}
  }
}

function endPlay(pid, $id) {
  $id.removeClass('playing'); //sentence
  var $player = jQuery('#' + pid);
  $player.find('*[data-refid=' + $id.attr('id') + ']').removeClass('playing'); //hit result
  
  //change sweet spot if user scrolls transcript while playing
  if ($player.find('.transcript.scroller').size() == 1) {
  	sweetSpot[pid] = $id.position().top;
  }
  
  for (var i=0; i<playListeners[pid].length; i++) {
  	var func = playListeners[pid][i];
  	func(pid, $id, 'endPlay');
  }
}

function endAll(pid) {
	var $player = jQuery('#' + pid);
	$player.find('.playing').each(function() {
		endPlay(pid, jQuery(this));
	});	
}

function jumpPlay(pid, $id) {
	var vid = jQuery('#' + pid).find('video,audio')[0];
	//canplaythrough works with safari and chrome, loadedmetadata works with firefox and chrome
  vid.addEventListener("onloadedmetadata", function() {
  	playOne(pid, $id);
  }, false);
}

function previous(pid) {
  var $player = jQuery('#' + pid);
  var n = playIndex[pid] > 0 ? playIndex[pid]-1 : 0;
  playOne(pid, jQuery(starts[pid][n].$item), psnSweet[pid]);
}
        
function sameAgain(pid) {
  var $player = jQuery('#' + pid);
  playOne(pid, jQuery(starts[pid][playIndex[pid]].$item), psnSweet[pid]);
}

function next(pid) {
  var $player = jQuery('#' + pid);
  var n = playIndex[pid] == starts[pid].length-1 ? playIndex[pid] : playIndex[pid]+1;
  playOne(pid, jQuery(starts[pid][n].$item), psnSweet[pid]);
}
