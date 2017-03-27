var NIBS = window.NIBS || {};

NIBS.CircleRun = function (data) {

	var that = this;

	this.data = data;
	this.startAngle = 0;
	this.target = document.getElementById(data.targetId);
	this.state = NIBS.CircleRun.states.at_start;
	this.canvas = document.createElement('canvas');
	this.canvas.id = data.targetId + '_canvas';

	this.setDim();
	this.target.appendChild(this.canvas);
	this.ctx = this.canvas.getContext('2d');

	this.strokeColor = data.strokeColor || '#308DBF';
	this.baseColor = data.baseColor || '#205E7F';
	this.edgeColor = data.edgeColor || '';
	this.edgeStrokeWidth = data.edgeStrokeWidth || 1;

	this.mode = data.mode || 'seconds';
	this.easeName = data.easeName || 'easeInOutQuart'; //See NIBS.CircleRun.ease
	this.onEnd = data.onEnd || function () {};
	this.onTick = data.onTick || function () {};
	this.autostart = data.autostart;
	this.animData = {};

	this.strokeWidth = (this.canvas.width / 2) * 0.1;

	that.setStroke();

	if (that.mode === 'seconds') {
		that.paintClock();
		this.start();
	}

	if (that.mode === 'animate') {
		that.animData.from = data.from;
		that.animData.to = data.to;
		that.animData.duration = data.duration;
		that.animData.frames = [];
		that.animData.frames.length = 0;
		that.animData.currFrame = 0;
		that.calcFrames();
		that.paint(that.animData.frames[0]);

		if (this.autostart) this.start();
	}

	function eventsManagment() {

		this.events = {};
		this.addEvent = function (node, event_, func) {
			if (node.addEventListener) {
				if (event_ in this.events) {
					node.addEventListener(event_, function () {
						func(node, event_);
						this.events[event_](win_doc, event_);
					}, true);
				} else {
					node.addEventListener(event_, function () {
						func(node, event_);
					}, true);
				}
				this.events[event_] = func;
			} else if (node.attachEvent) {

				var ie_event = 'on' + event_;
				if (ie_event in this.events) {
					node.attachEvent(ie_event, function () {
						func(node, ie_event);
						this.events[ie_event]();
					});
				} else {
					node.attachEvent(ie_event, function () {
						func(node, ie_event);
					});
				}
				this.events[ie_event] = func;
			}
		}
		this.removeEvent = function (node, event_) {
			if (node.removeEventListener) {
				node.removeEventListener(event_, this.events[event_], true);
				this.events[event_] = null;
				delete this.events[event_];
			} else if (node.detachEvent) {
				node.detachEvent(event_, this.events[event_]);
				this.events[event_] = null;
				delete this.events[event_];
			}
		}

	}

	var EM = new eventsManagment();

	EM.addEvent(window, 'resize', function (win, doc, event_) {

		that.setDim();
		that.setStroke();

		if (that.state !== NIBS.CircleRun.states.running) {
			that.paint(that.animData.frames[that.animData.currFrame]);
		}

	});

};

NIBS.CircleRun.ease = {
	linearTween: function(t, b, c, d) {
		return c * t / d + b;
	},
	easeInQuad: function(t, b, c, d) {
		t /= d;
		return c * t * t + b;
	},
	easeOutQuad: function(t, b, c, d) {
		t /= d;
		return -c * t * (t - 2) + b;
	},
	easeInOutQuad: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	},
	easeInCubic: function(t, b, c, d) {
		t /= d;
		return c * t * t * t + b;
	},
	easeOutCubic: function(t, b, c, d) {
		t /= d;
		t--;
		return c * (t * t * t + 1) + b;
	},
	easeInOutCubic: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t * t + b;
		t -= 2;
		return c / 2 * (t * t * t + 2) + b;
	},
	easeInQuart: function(t, b, c, d) {
		t /= d;
		return c * t * t * t * t + b;
	},
	easeOutQuart: function(t, b, c, d) {
		t /= d;
		t--;
		return -c * (t * t * t * t - 1) + b;
	},
	easeInOutQuart: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t * t * t + b;
		t -= 2;
		return -c / 2 * (t * t * t * t - 2) + b;
	},
	easeInQuint: function(t, b, c, d) {
		t /= d;
		return c * t * t * t * t * t + b;
	},
	easeOutQuint: function(t, b, c, d) {
		t /= d;
		t--;
		return c * (t * t * t * t * t + 1) + b;
	},
	easeInOutQuint: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t * t * t * t + b;
		t -= 2;
		return c / 2 * (t * t * t * t * t + 2) + b;
	},
	easeInSine: function(t, b, c, d) {
		return -c * cos(t / d * (PI / 2)) + c + b;
	},
	easeOutSine: function(t, b, c, d) {
		return c * sin(t / d * (PI / 2)) + b;
	},
	easeInOutSine: function(t, b, c, d) {
		return -c / 2 * (cos(PI * t / d) - 1) + b;
	},
	easeInExpo: function(t, b, c, d) {
		return c * pow(2, 10 * (t / d - 1)) + b;
	},
	easeOutExpo: function(t, b, c, d) {
		return c * (-pow(2, -10 * t / d) + 1) + b;
	},
	easeInOutExpo: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * pow(2, 10 * (t - 1)) + b;
		t--;
		return c / 2 * (-pow(2, -10 * t) + 2) + b;
	},
	easeInCirc: function(t, b, c, d) {
		t /= d;
		return -c * (sqrt(1 - t * t) - 1) + b;
	},
	easeOutCirc: function(t, b, c, d) {
		t /= d;
		t--;
		return c * sqrt(1 - t * t) + b;
	},
	easeInOutCirc: function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) return -c / 2 * (sqrt(1 - t * t) - 1) + b;
		t -= 2;
		return c / 2 * (sqrt(1 - t * t) + 1) + b;
	}
};


NIBS.CircleRun.fps = 60;

NIBS.CircleRun.prototype = {};

NIBS.CircleRun.states = {

	init: 'INIT',
	running: 'RUNNING',
	at_start: 'AT_START',
	at_end: 'AT_END',
	destroyed: 'DESTROYED',
	paused: 'PAUSED'

};

NIBS.CircleRun.prototype.setDim = function () {

	var that = this;
	that.canvas.width = that.target.offsetWidth;
	that.canvas.height = that.target.offsetWidth;

};

NIBS.CircleRun.prototype.setStroke = function () {

	var that = this;
	that.strokeWidth = that.strokeWidth; //Default value

	if (typeof (that.data.strokeWidth) === 'string') {
		that.strokeWidth = that.widthFromPercent(that.data.strokeWidth)
	} else if (that.data.strokeWidth) {
		that.strokeWidth = that.data.strokeWidth;
	}

};

NIBS.CircleRun.prototype.calcFrames = function () {

	var that = this,
		i,
		noOfFrames = that.animData.duration * NIBS.CircleRun.fps,
		delta = that.animData.to - that.animData.from,
		stepSize = delta / (noOfFrames - 1),
		prog,
		easeVal,
		frameVal;

	var easeInOut = function(t, b, c, d) {
		t /= d / 3;
		if (t < 1.5) return c / 3 * t * t + b;
		t--;
		return -c / 3 * (t * (t - 3) - 1) + b;
	};

	for (i = 0; i < noOfFrames; i += 1) {

		prog = i / (noOfFrames - 1);
		easeVal = NIBS.CircleRun.ease[that.easeName](prog, 0, 1, 1);
		frameVal = that.animData.from + ((that.animData.to - that.animData.from) * easeVal)
		that.animData.frames.push(frameVal);

	}

};

NIBS.CircleRun.prototype.start = function (percent) {

	var that = this;
	clearInterval(that.interval);

	that.animData.currFrame = 0;
	that.interval = setInterval(function () {

		if (that.mode === 'seconds') {
			that.paintClock();
		}

		if (that.mode === 'animate') {
			that.animData.currFrame++;
			that.paintAnimation();
		}

	}, 1000 / NIBS.CircleRun.fps);
};

NIBS.CircleRun.prototype.rev = function (percent) {

	var that = this;
	clearInterval(that.interval);

	that.animData.currFrame = that.animData.frames.length;
	that.interval = setInterval(function () {

		that.animData.currFrame--;
		if (that.animData.currFrame > -1) {
			that.paint(that.animData.frames[that.animData.currFrame]);
			that.runOnTick();
		} else {
			that.pause();
			that.runOnTick();
			that.onEnd();
			that.state = NIBS.CircleRun.states.at_start;
		}


	}, 1000 / NIBS.CircleRun.fps);
};

NIBS.CircleRun.prototype.runOnTick = function () {

	var that = this;
	that.onTick({
		progress: (that.animData.currFrame / that.animData.frames.length),
		angle: that.animData.frames[that.animData.currFrame],
		frame: that.animData.currFrame
	});

};

NIBS.CircleRun.prototype.paintAnimation = function () {

	var that = this;
	
	if (that.animData.frames.length > that.animData.currFrame) {
		that.paint(that.animData.frames[that.animData.currFrame]);
		that.runOnTick();
		that.state = NIBS.CircleRun.states.running;
	} else {
		that.pause();
		that.runOnTick();
		that.onEnd();
		that.state = NIBS.CircleRun.states.at_end;
		that.animData.currFrame = that.animData.frames.length - 1;
	}
};

NIBS.CircleRun.prototype.pause = function (percent) {

	var that = this;
	clearInterval(this.interval);
	that.state = NIBS.CircleRun.states.paused;

}


NIBS.CircleRun.prototype.destroy = function (percent) {

	var that = this;
	that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
	clearInterval(that.interval);
	that.state = NIBS.CircleRun.states.destroyed;

};

NIBS.CircleRun.prototype.widthFromPercent = function (percent) {

	var that = this,
		pr = percent.split('%').join(''),
		rv = (that.canvas.width / 2) * 0.1;

	if (!isNaN(pr)) {
		pr = parseFloat(pr) / 100;
		rv = (that.canvas.width / 2) * pr;
		return rv;
	}
	return rv;

};

NIBS.CircleRun.prototype.drawArc = function (startFrom, endAt, o) {

	var that = this;

	o = o || {};
	that.ctx.beginPath();
	that.ctx.arc(that.canvas.width / 2, that.canvas.width / 2, that.canvas.width / 2 - (that.strokeWidth * 1.05 / 2), (startFrom - 90) * (Math.PI / 180), (endAt - 90) * (Math.PI / 180));
	that.ctx.strokeStyle = o.strokeStyle || that.strokeColor;
	that.ctx.lineWidth = o.lineWidth || 2;
	that.ctx.stroke();

};

NIBS.CircleRun.prototype.paintClock = function () {

	var that = this,
		d = new Date(),
		k = 360 / 60,
		seconds = d.getSeconds(),
		end = seconds * k + (k * d.getMilliseconds() / 1000);

	that.paint(end);

};

NIBS.CircleRun.prototype.reset = function () {

	var that = this;
	that.animData.currFrame = 0;
	that.paint(that.animData.frames[that.animData.currFrame]);
	that.state = NIBS.CircleRun.states.at_start;

};

NIBS.CircleRun.prototype.paint = function (angle) {

	var that = this;
	that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);

	if (that.baseColor !== 'transparent') {
		that.drawArc(that.startAngle, 360 + that.startAngle, {
			strokeStyle: that.baseColor,
			lineWidth: that.strokeWidth
		});
	}


	if (that.edgeColor) {
		var strokeWidth = that.edgeStrokeWidth;

		if (angle < that.startAngle + 2) {
			strokeWidth = strokeWidth / 2;
		}
		that.drawArc(that.startAngle - (strokeWidth), angle + strokeWidth, {
			strokeStyle: that.edgeColor,
			lineWidth: that.strokeWidth
		});
	}

	that.drawArc(that.startAngle, angle, {
		lineWidth: that.strokeWidth
	});

};