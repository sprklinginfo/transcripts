//adapted from http://www.learningjquery.com/2010/06/a-jquery-ui-combobox-under-the-hood

(function( $ ) {
		$.widget( "ui.combobox", {	
			options: {
				editOption: null,
				newOption: null
			},
			
			_create: function() {
				var self = this,
					select = this.element.hide(),
					selected = select.children( ":selected" ),
					value = selected.val() ? selected.text() : "";
        
				var $last = select.children("option:last-child");
				$last.data('newtext','(' + $last.text() + ')');
    
				var input = this.input = $( "<input>" )
					.insertAfter( select )
					.val( value )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: function( request, response ) {
							var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
							var exact = false;
							var r = select.children("option").not(':last-child').map(function() {
								var text = $( this ).text();
								if ( this.value && ( !request.term || matcher.test(text) ) ) {
									if (request.term.toLowerCase().trim() == text.toLowerCase().trim())
										exact = true;
									
									return {
										label: request.term == '' ? text : text.replace(
											new RegExp(
												"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
											), "<strong>$1</strong>" ),
										value: text,
										option: this
									};
								}
							});
	
							if (request.term == '' || exact) {
								response(r);
							}
							else {
								var msg = " <span class='newitem-msg'>" + $last.data('newtext') + "</span>";
								$last.attr('value',request.term).text(request.term);
								r.push({
									label: request.term + msg,
									value: request.term,
									option: $last[0],
									type: 'new'
								});
								response(r);
							}
						},
						select: function( event, ui ) {
							ui.item.option.selected = true;
							self._trigger( "selected", event, {
								item: ui.item.option
							});
							if (ui.item.type == 'new' && $.isFunction(self.options.newOption)) {
								self.options.newOption($last[0], ui.item.option.value);
							}
							select.change(); //EDGE inserted
						},
						change: function( event, ui ) {
							if ( !ui.item ) {
								var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
									valid = false;
								select.children( "option" ).each(function() {
									if ( $( this ).text().match( matcher ) ) {
										this.selected = valid = true;
										return false;
									}
								});
								if ( !valid ) {
									// remove invalid value, as it didn't match anything
									$( this ).val( "" );
									select.val( "" );
									input.data( "autocomplete" ).term = "";
									return false;
								}
							}
						}
					})
					.addClass( "ui-widget ui-widget-content ui-corner-left" );
					
				input.data( "autocomplete" )._renderItem = function( ul, item ) {
					if (item.type == 'new') {
						return $( "<li class='itemlink newitem'></li>" )
							.data( "item.autocomplete", item )
							.append( "<a>" + item.label + "</a>" )
							.appendTo( ul );
					}
					else {
						var $li = $("<li class='itemlink'></li>");
						
						var $pencil = $('<span style="float:left;" class="edit-name ui-icon ui-icon-pencil" title="Edit">&nbsp;</span>')
							.click(function(e) {
								e.stopPropagation();
							
								var $span = $li.find('.itemname');
								var $input = $('<input class="editoption" type="text">')
									.val(item.value)
									.click(function(e) {
										e.stopPropagation();
									})
									.focus(function() {
										$li.addClass('editing');
									})
									.blur(function() {
										$(this).replaceWith("<span class='itemname'>" + item.label + "</span>");
										$li.removeClass('editing');
									})
									.keydown(function(e) {
										var keyCode = $.ui.keyCode;
										switch (e.keyCode) {
											case keyCode.ESCAPE:
												e.preventDefault();
												$(this).blur();//.replaceWith("<span class='itemname'>" + item.label + "</span>");
												break;
											case keyCode.ENTER:
											case keyCode.NUMPAD_ENTER:
												e.preventDefault();
												e.stopPropagation();
												//passthrough
											case keyCode.TAB:
												var val = $(this).val().trim();
												if ($('option[value='+val+']',select).size()==0) {
													var $option = $(item.option);
													var old = $option.attr('value');
													item.label = item.value = val;
													$option.attr({'selected':'selected','value':val}).text(val);
													if ($.isFunction(self.options.editOption)) {
														self.options.editOption($option, old);
													}
													$(this).blur();//.replaceWith("<span class='itemname'>" + item.label + "</span>");
													$li.find('a').focus().click(); //select menu item
												}
												else {
													$(this).blur();//.replaceWith("<span class='itemname'>" + item.label + "</span>");
												}
												break;
										}
									})
									.css('height',$span.css('height'));
								
								$span.replaceWith($input);
								$input.focus().click();
							});
							
						var $links = $('<div class="itemedit-links"></div>').append($pencil);
						return $li.data( "item.autocomplete", item )
							.append($links)
							.append($("<a><span class='itemname'>" + item.label + "</span></a>"))
							.appendTo( ul );
					}
				};
					
				this.button = $( "<button type='button'>&nbsp;</button>" )
					.attr( "tabIndex", -1 )
					.attr( "title", "Show All Items" )
					.insertAfter( input )
					.button({
						icons: {
							primary: "ui-icon-triangle-1-s"
						},
						text: false
					})
					.removeClass( "ui-corner-all" )
					.addClass( "ui-corner-right ui-button-icon" )
					.click(function(e) {
						// close if already visible
						if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
							input.autocomplete( "close" );
							return;
						}
						
						// work around a bug (likely same cause as #5265)
						$(this).blur(); 

						// pass empty string as value to search for, displaying all results
						input.autocomplete( "search", "" );
						input.focus();
					});
					
			},
			
			destroy: function() {
				this.input.remove();
				this.button.remove();
				this.element.show();
				$.Widget.prototype.destroy.call( this );
			}
		});
})( jQuery );
