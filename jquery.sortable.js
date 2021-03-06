/*
 * HTML5 Sortable jQuery Plugin
 * https://github.com/nfm/html5sortable
 *
 * Original version by farhadi:
 * https://github.com/farhadi/html5sortable
 *
 * This version is based on bgooren's fork, which contains fixes for nested sortables and dragging between lists with the same index:
 * https://github.com/bgooren/html5sortable
 * 
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 */
(function($) {
var dragging, placeholders = $();
$.fn.sortable = function(options) {
	var method = String(options);
	options = $.extend({
		connectWith: false
	}, options);
	return this.each(function() {
		if (/^enable|disable|destroy$/.test(method)) {
			var items = $(this).children($(this).data('items'));
			var handles = $(this).children($(this).data('handles')).attr('draggable', method == 'enable');
			if (method == 'destroy') {
				$(this).off('sortupdate');
				items.add(this).removeData('connectWith items')
					.off('dragstart.h5s dragend.h5s dragover.h5s dragenter.h5s drop.h5s');
				handles.off('selectstart.h5s');
			}
			return;
		}
		var index, items = $(this).children(options.items), handles = options.handle ? items.find(options.handle) : items;
		var parent;
		var placeholder = $('<' + (/^ul|ol$/i.test(this.tagName) ? 'li' : 'div') + ' class="sortable-placeholder">');
		$(this).data('items', options.items)
		$(this).data('handles', options.handle ? options.handle : options.items)
		placeholders = placeholders.add(placeholder);
		if (options.connectWith) {
			$(options.connectWith).add(this).data('connectWith', options.connectWith);
		}
		// Setup drag handles
		handles.attr('draggable', 'true').not('a[href], img').on('selectstart.h5s', function() {
			this.dragDrop && this.dragDrop();
			return false;
		}).end();
		
		// Handle drag events on draggable items
		items.on('dragstart.h5s', function(e) {
			var dt = e.originalEvent.dataTransfer;
			dt.effectAllowed = 'move';
			dt.setData('Text', 'dummy');
			index = (dragging = $(this)).addClass('sortable-dragging').index();
			parent = dragging.parent();
			e.stopPropagation();
		}).on('dragend.h5s', function() {
			if (!dragging) {
				return;
			}
			dragging.removeClass('sortable-dragging').show();
			placeholders.detach();
			if (index != dragging.index() || !parent.is(dragging.parent())) {
				dragging.parent().trigger('sortupdate', {item: dragging});
			}
			dragging = null;
			parent = null;
		}).add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {
			if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
				return true;
			}
			if (e.type == 'drop') {
				e.stopPropagation();
				placeholders.filter(':visible').after(dragging);
				dragging.trigger('dragend.h5s');
				return false;
			}
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'move';
			if (items.is(this)) {
				dragging.hide();
				if (options.forcePlaceholderSize) {
					placeholder.height(dragging.outerHeight());
				}
				$(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
				placeholders.not(placeholder).detach();
			} else if (!placeholders.is(this)) {
				if (!$(this).children(options.items).length || ($(this).children(options.items).length == 1 && $(this).children().is(dragging))) {
					placeholders.detach();
					$(this).append(placeholder);
				}
			}
			return false;
		});
	});
};
})(jQuery);
