(function($) {
	$.editable.addInputType('elastic', {
			element : function(settings, original) {
					var textarea = $('<textarea />');
					if (settings.rows) {
							textarea.attr('rows', settings.rows);
					} else {
							textarea.height(settings.height);
					}
					if (settings.cols) {
							textarea.attr('cols', settings.cols);
					} else {
							textarea.width(settings.width);
					}
					$(this).append(textarea);
					return(textarea);
			},
			plugin : function(settings, original) {
				$('textarea', this).elastic(settings.elastic);
				$('textarea', this).trigger('update');
			}
	});
})(jQuery);
