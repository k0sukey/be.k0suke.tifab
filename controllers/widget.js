var args = arguments[0] || {};

args.items = args.items || [];

if (args.direction !== 'up' && args.direction !== 'right' &&
	args.direction !== 'down' && args.direction !== 'left') {
	args.direction = 'up';
}

var WIDTH = 56,
	HEIGHT = 56,
	TOGGLE = false,
	ITEMS = [],
	MARGIN = 10;

function doTouch(e) {
	if (/^__child\d+$/.test(e.source.id)) {
		var index = e.source.id.replace(/^__child/, '');

		if (!_.has(args.items[index], 'focusedColor')) {
			return;
		}

		e.source.getChildren()[0].applyProperties({
			borderColor: e.type === 'touchstart' ? args.items[index].focusedColor : args.items[index].backgroundColor || '#ccfafafa'
		});
	} else {
		if (!_.has(args, 'focusedColor')) {
			return;
		}

		e.source.getChildren()[0].applyProperties({
			borderColor: e.type === 'touchstart' ? args.focusedColor : args.backgroundColor || '#ccfafafa'
		});
	}
}

function open() {
	doTouch({
		type: 'touchstart',
		source: $.widget
	});

	var parent = $.widget.getParent();

	_.each(ITEMS, function(item, index){
		parent.add(item);

		var bounce = {
				x: 0,
				y: 0,
			},
			destination = {
				x: 0,
				y: 0,
			};

		switch (args.direction) {
			case 'up':
				destination.y = ((ITEMS.length - 1 - index) * (item.getHeight() + MARGIN) + $.widget.getHeight() + $.widget.getBottom()) - MARGIN;
				bounce.y = (destination.y + MARGIN / 2) * -1;
				destination.y = destination.y * -1;
				break;
			case 'right':
				destination.x = (ITEMS.length - 1 - index) * (item.getWidth() + MARGIN) + $.widget.getWidth() + $.widget.getLeft();
				bounce.x = destination.x + MARGIN / 2;
				break;
			case 'down':
				destination.y = (ITEMS.length - 1 - index) * (item.getHeight() + MARGIN) + $.widget.getHeight() + $.widget.getTop() - MARGIN;
				bounce.y = destination.y + MARGIN / 2;
				break;
			case 'left':
				destination.x = (ITEMS.length - 1 - index) * (item.getWidth() + MARGIN) + $.widget.getWidth() + $.widget.getRight();
				bounce.x = (destination.x + MARGIN / 2) * -1;
				destination.x = destination.x * -1;
				break;
		}

		if (OS_ANDROID) {
			destination.x = destination.x * Ti.Platform.displayCaps.logicalDensityFactor;
			destination.y = destination.y * Ti.Platform.displayCaps.logicalDensityFactor;
			bounce.x = bounce.x * Ti.Platform.displayCaps.logicalDensityFactor;
			bounce.y = bounce.y * Ti.Platform.displayCaps.logicalDensityFactor;
		}

		item.animate({
			transform: Ti.UI.create2DMatrix().translate(bounce.x, bounce.y),
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			opacity: 1.0,
			duration: 100,
			delay: index * 10
		}, function(){
			item.animate({
				transform: Ti.UI.create2DMatrix().translate(destination.x, destination.y),
				curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
				duration: 100
			}, function(){
				if (index >= ITEMS.length - 1) {
					_.each(ITEMS, function(_item){
						_item.applyProperties({
							touchEnabled: true
						});
					});

					$.widget.applyProperties({
						touchEnabled: true
					});
				}
			});
		});
	});
}

function close() {
	doTouch({
		type: 'touchend',
		source: $.widget
	});

	var parent = $.widget.getParent(),
		position = {};

	_.each(ITEMS, function(item, index){
		item.applyProperties({
			touchEnabled: false
		});

		switch (args.direction) {
			case 'up':
				position.bottom = $.widget.getBottom();
				break;
			case 'right':
				position.left = $.widget.getLeft();
				break;
			case 'down':
				position.top = $.widget.getTop();
				break;
			case 'left':
				position.right = $.widget.getRight();
				break;
		}

		item.animate({
			transform: Ti.UI.create2DMatrix(),
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
			opacity: 0.0,
			duration: 100,
			delay: index * 10
		}, function(){
			parent.remove(item);

			if (index >= ITEMS.length - 1) {
				$.widget.applyProperties({
					touchEnabled: true
				});
			}
		});
	});
}

var doClick = _.debounce(function(){
	$.widget.applyProperties({
		touchEnabled: false
	});

	$.widget.fireEvent('toggle', {
		type: 'toggle',
		expansion: TOGGLE ? 'close' : 'open'
	});

	TOGGLE ? close() : open();

	if (_.has(args, 'rotation') && args.rotation) {
		$.title.animate({
			transform: TOGGLE ? Ti.UI.create2DMatrix().rotate(-15) : Ti.UI.create2DMatrix().rotate(60),
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			duration: 100
		}, function(){
			$.title.animate({
				transform: TOGGLE ? Ti.UI.create2DMatrix() : Ti.UI.create2DMatrix().rotate(45),
				curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
				duration: 100
			}, function(){
				TOGGLE = !TOGGLE;
			});
		});
	} else {
		TOGGLE = !TOGGLE;
	}
}, 500, true);
exports.toggle = doClick;

var doItemclick = _.debounce(function(e){
	doClick();

	$.widget.fireEvent('itemclick', _.extend({
		index: parseInt(e.source.id.replace(/^__child/, ''), 10)
	}, e));
}, 500, true);

$.on = function(event, callback){
	$.widget.addEventListener(event, callback);
};

$.off = function(event, callback){
	$.widget.removeEventListener(event, callback);
};

$.trigger = function(event, args){
	$.widget.fireEvent(event, args);
};

var widget = {
		top: _.has(args, 'top') ? args.top : null,
		right: _.has(args, 'right') ? args.right : null,
		bottom: _.has(args, 'bottom') ? args.bottom : null,
		left: _.has(args, 'left') ? args.left : null,
		width: _.has(args, 'width') ? args.width : WIDTH,
		height: _.has(args, 'height') ? args.height : HEIGHT
	},
	circle = {
		width: _.has(args, 'width') ? args.width : WIDTH,
		height: _.has(args, 'height') ? args.height : HEIGHT,
		borderRadius: _.has(args, 'width') ? args.width / 2 : WIDTH / 2,
		borderWidth: _.has(args, 'width') ? args.width / 2 : WIDTH / 2,
		borderColor: _.has(args, 'backgroundColor') ? args.backgroundColor : '#ccfafafa'
	},
	title = {
		width: _.has(args, 'width') ? args.width : WIDTH,
		height: _.has(args, 'height') ? args.height : HEIGHT,
		text: _.has(args, 'title') ? args.title : '',
		color: _.has(args, 'color') ? args.color : '#808080',
		font: _.has(args, 'font') ? args.font : {},
		textAlign: _.has(args, 'textAlign') ? args.textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign: _.has(args, 'verticalAlign') ? args.verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	};

$.widget.applyProperties(widget);
$.circle.applyProperties(circle);
$.title.applyProperties(title);

_.each(args.items, function(item, index){
	var container = Ti.UI.createView(_.extend(widget, {
		id: '__child' + index,
		top: _.has(args, 'top') ? args.top : null,
		right: _.has(args, 'right') ? args.right : null,
		bottom: _.has(args, 'bottom') ? args.bottom : null,
		left: _.has(args, 'left') ? args.left : null,
		width: _.has(item, 'width') ? item.width : WIDTH,
		height: _.has(item, 'height') ? item.height : HEIGHT,
		touchEnabled: false,
		zIndex: 1000 - index,
		opacity: 0.0
	}));

	container.add(Ti.UI.createView(_.extend(circle, {
		width: _.has(item, 'width') ? item.width : WIDTH,
		height: _.has(item, 'height') ? item.height : HEIGHT,
		borderRadius: _.has(item, 'width') ? item.width / 2 : WIDTH / 2,
		borderWidth: _.has(item, 'width') ? item.width / 2 : WIDTH / 2,
		borderColor: _.has(item, 'backgroundColor') ? item.backgroundColor : '#ccfafafa',
		opacity: 1.0,
		touchEnabled: false
	})));

	container.add(Ti.UI.createLabel(_.extend(title, {
		width: _.has(item, 'width') ? item.width : WIDTH,
		height: _.has(item, 'height') ? item.height : HEIGHT,
		text: _.has(item, 'title') ? item.title : '',
		color: _.has(item, 'color') ? item.color : '#808080',
		font: _.has(item, 'font') ? item.font : {},
		textAlign: _.has(item, 'textAlign') ? item.textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign: _.has(item, 'verticalAlign') ? item.verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		touchEnabled: false
	})));

	container.addEventListener('click', doItemclick);
	container.addEventListener('touchstart', doTouch);
	container.addEventListener('touchcancel', doTouch);
	container.addEventListener('touchend', doTouch);

	ITEMS.push(container);
});