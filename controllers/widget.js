var args = arguments[0] || {};

args.items = args.items || [];

if (args.direction !== 'up' && args.direction !== 'right' &&
	args.direction !== 'down' && args.direction !== 'left') {
	args.direction = 'up';
}

var WIDTH = 60,
	HEIGHT = 60,
	TOGGLE = false,
	ITEMS = [],
	MARGIN = 10;

function doTouch(e) {
	if (/^__child\d+$/.test(e.source.id)) {
		var index = e.source.id.replace(/^__child/, '');

		if (!_.has(args.items[index], 'focusedColor')) {
			return;
		}

		e.source.children[0].applyProperties({
			borderColor: e.type === 'touchstart' ? args.items[index].focusedColor : args.items[index].backgroundColor || '#ccfafafa'
		});
	} else {
		if (!_.has(args, 'focusedColor')) {
			return;
		}

		e.source.children[0].applyProperties({
			borderColor: e.type === 'touchstart' ? args.focusedColor : args.backgroundColor || '#ccfafafa'
		});
	}
}

function open() {
	doTouch({
		type: 'touchstart',
		source: $.widget
	});

	var parent = $.widget.parent;

	_.each(ITEMS, function(item, index){
		parent.add(item);

		var bounce = {},
			destination = {};

		switch (args.direction) {
			case 'up':
				destination.bottom = (ITEMS.length - 1 - index) * (item.height + MARGIN) + $.widget.height + $.widget.bottom + MARGIN;
				bounce.bottom = destination.bottom + MARGIN;
				break;
			case 'right':
				destination.left = (ITEMS.length - 1 - index) * (item.width + MARGIN) + $.widget.width + $.widget.left + MARGIN;
				bounce.left = destination.left + MARGIN;
				break;
			case 'down':
				destination.top = (ITEMS.length - 1 - index) * (item.height + MARGIN) + $.widget.height + $.widget.top + MARGIN;
				bounce.top = destination.top + MARGIN;
				break;
			case 'left':
				destination.right = (ITEMS.length - 1 - index) * (item.width + MARGIN) + $.widget.width + $.widget.right + MARGIN;
				bounce.right = destination.right + MARGIN;
				break;
		}

		item.animate(_.extend(bounce, {
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			opacity: 1.0,
			duration: 100,
			delay: index * 100
		}), function(){
			item.animate(_.extend(destination, {
				curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
				duration: 100
			}), function(){
				item.applyProperties({
					touchEnabled: true
				});

				if (index >= ITEMS.length - 1) {
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

	var parent = $.widget.parent,
		position = {};

	_.each(ITEMS, function(item, index){
		item.applyProperties({
			touchEnabled: false
		});

		switch (args.direction) {
			case 'up':
				position.bottom = $.widget.bottom;
				break;
			case 'right':
				position.left = $.widget.left;
				break;
			case 'down':
				position.top = $.widget.top;
				break;
			case 'left':
				position.right = $.widget.right;
				break;
		}

		item.animate(_.extend({
			transform: Ti.UI.createMatrix2D(),
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
			opacity: 0.0,
			duration: 100,
			delay: index * 10
		}, position), function(){
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
			transform: TOGGLE ? Ti.UI.createMatrix2D().rotate(-15) : Ti.UI.createMatrix2D().rotate(60),
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			duration: 100
		}, function(){
			$.title.animate({
				transform: TOGGLE ? Ti.UI.createMatrix2D() : Ti.UI.createMatrix2D().rotate(45),
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
		index: e.source.id.replace(/^__child/, '')
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
		height: _.has(args, 'height') ? args.height : HEIGHT,
		//borderColor:"#ff0000"
	},
	circle = {
		width: _.has(args, 'width') ? args.width : WIDTH,
		height: _.has(args, 'height') ? args.height : HEIGHT,
		borderRadius: _.has(args, 'width') ? args.width / 2 : WIDTH / 2,
		borderWidth: _.has(args, 'width') ? args.width / 2 : WIDTH / 2,
		borderColor: _.has(args, 'backgroundColor') ? args.backgroundColor : '#ccfafafa',
		right:0
	},
	title = {
		width: _.has(args, 'width') ? args.width : WIDTH,
		height: _.has(args, 'height') ? args.height : HEIGHT,
		text: _.has(args, 'title') ? args.title : '',
		color: _.has(args, 'color') ? args.color : '#808080',
		font: _.has(args, 'font') ? args.font : {},
		textAlign: _.has(args, 'textAlign') ? args.textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign: _.has(args, 'verticalAlign') ? args.verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		right:0
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
		width: _.has(item, 'width') ? item.width : Ti.UI.SIZE,
		height: _.has(item, 'height') ? item.height : HEIGHT,
		// borderColor:"#ff0000",
		touchEnabled: false,
		zIndex: 1000 - index,
		opacity: 0.0
	}));
	
	if(item.hasOwnProperty("desc"))
	{
		Ti.API.log(item.desc);
		var descView = Ti.UI.createView({
			right:70,
			backgroundColor:_.has(item.desc, "backgroundColor")?item.desc.backgroundColor:"#d91a1a1a",
			width:Ti.UI.SIZE,
			height:35,
			borderRadius:_.has(item.desc, "borderRadius")?item.desc.borderRadius:10,
			layout:"horizontal"
		});
		var descPaddingLeft = Ti.UI.createView({
			width:_.has(item.desc, "paddingLeft")?item.desc.paddingLeft:10,
			top:0,
			left:0
		});
		descView.add(descPaddingLeft);
		var descLabel = Ti.UI.createLabel({
			color:_.has(item.desc, "color")?item.desc.color:"#ffffff",
			left:0,
			text:_.has(item.desc, "title")?item.desc.title:"#Item "+index,
			font:{
				fontSize:_.has(item.desc, "fontSize")?item.desc.font.fontSize:14,
			}
		});
		descView.add(descLabel);
		var descPaddingRight = Ti.UI.createView({
			width:_.has(item.desc, "paddingHRight")?item.desc.paddingRight:10,
			top:0,
			left:0
		});
		descView.add(descPaddingRight);
		container.add(descView);
	}
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
