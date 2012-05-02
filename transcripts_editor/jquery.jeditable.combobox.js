(function($) {
	$.editable.addInputType('combobox', {
								element : function(settings, original) {
                    var select = $('<select class="combobox" />');
                    $(this).append(select);
                    return(select);
                },
                content : function(data, settings, original) {
                    /* If it is string assume it is json. */
                    if (String == data.constructor) {      
                        eval ('var json = ' + data);
                    } else {
                    /* Otherwise assume it is a hash already. */
                        var json = data;
                    }
                    for (var key in json) {
                        if (!json.hasOwnProperty(key)) {
                            continue;
                        }
                        if ('selected' == key) {
                            continue;
                        } 
                        var option = $('<option />').val(key).append(json[key]);
                        $('select', this).append(option);    
                    }                    
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == $.trim(original.revert)) {
                                $(this).attr('selected', 'selected');
                        }
                    });
                },
								plugin : function(settings, original) {
									var form = $(this);
									var select = form.find('select.combobox')
										.append($("<option></option>")
											.attr("value",'+')
											.text('New speaker'));
									
									select.combobox().change(function() {
										form.submit();
									});
									/*
									var button = form.find('button');
									var input = form.find('input');
									var t;
									input.blur(function() {
										t = setTimeout(
											function() {
												form.submit();
											}, 200);
										}).focus(function() {
											if (t) {
												clearTimeout(t);
											}
										});
									button.click(function() {
										input.focus();
									});*/
								}
	});
})(jQuery);
