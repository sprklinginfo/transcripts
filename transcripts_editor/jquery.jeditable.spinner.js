(function($) {
	$.editable.addInputType('spinner', {
			element : function(settings, original) {
					var input = $('<input/>');
					$(this).append(input);
					return(input);
			},
			plugin : function(settings, original) {
				$('input', this).spinner(settings.spinner);
			}
	});
})(jQuery);
