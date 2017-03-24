var NIBS = window.NIBS || {};
var c = (console) ? console : {log: function () {}}; c.l = c.log;

NIBS.CircleRun = function (data) {

	var oThis = this; 

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
	this.onEnd = data.onEnd || function () {};
	this.onTick = data.onTick || function () {};
	this.autostart = data.autostart;
	this.animData = {};

	this._strokeWidth = (this.canvas.width / 2) * 0.1;
	
	oThis.setStroke();

	if (oThis.mode === 'seconds') {
		oThis.paintClock();
		this.start();
	}

	if (oThis.mode === 'animate') {
		oThis.animData.from = data.from;
		oThis.animData.to = data.to;
		oThis.animData.duration = data.duration;
		oThis.animData.frames = [];
		oThis.animData.frames.length = 0;
		oThis.animData.currFrame = 0;
		oThis.calcFrames();
		oThis.paint(oThis.animData.frames[0]);

		if (this.autostart) this.start();
	}


	function events_managment(){
	    this.events = {};
	    this.addEvent = function(node, event_, func){
	        if(node.addEventListener){
	            if(event_ in this.events){
	                node.addEventListener(event_, function(){
	                    func(node, event_);
	                    this.events[event_](win_doc, event_);
	                }, true);
	            }else{
	                node.addEventListener(event_, function(){
	                    func(node, event_);
	                }, true);
	            }
	            this.events[event_] = func;
	        }else if(node.attachEvent){

	            var ie_event = 'on' + event_;
	            if(ie_event in this.events){
	                node.attachEvent(ie_event, function(){
	                    func(node, ie_event);
	                    this.events[ie_event]();
	                });
	            }else{
	                node.attachEvent(ie_event, function(){
	                    func(node, ie_event);
	                });
	            }
	            this.events[ie_event] = func;
	        }
	    }
	    this.removeEvent = function(node, event_){
	        if(node.removeEventListener){
	            node.removeEventListener(event_, this.events[event_], true);
	            this.events[event_] = null;
	            delete this.events[event_];
	        }else if(node.detachEvent){
	            node.detachEvent(event_, this.events[event_]);
	            this.events[event_] = null;
	            delete this.events[event_];
	        }
	    }
	}

	var EM = new events_managment();

	EM.addEvent(window, 'resize', function(win,doc, event_){

	    oThis.setDim();
	    oThis.setStroke();

	    if (oThis.state !== NIBS.CircleRun.states.running) {
	    	oThis.paint(oThis.animData.frames[oThis.animData.currFrame]);
	    }

	});

	
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
	
	var oThis = this; 
	oThis.canvas.width = oThis.target.offsetWidth;
	oThis.canvas.height = oThis.target.offsetWidth;

}

NIBS.CircleRun.prototype.setStroke = function () {
	
	var oThis = this; 
	oThis.strokeWidth = oThis._strokeWidth; //Default value

	if (typeof(oThis.data.strokeWidth) === 'string') {
		oThis._strokeWidth = oThis.widthFromPercent(oThis.data.strokeWidth)
	} else if (oThis.data.strokeWidth) {
		oThis._strokeWidth = oThis.data.strokeWidth;
	}

}

NIBS.CircleRun.prototype.calcFrames = function () {
	
	var i,
		oThis = this,
		noOfFrames = oThis.animData.duration * NIBS.CircleRun.fps,
		delta = oThis.animData.to - oThis.animData.from,
		stepSize = delta / (noOfFrames - 1);

	for (i = 0; i < noOfFrames; i += 1) {
		oThis.animData.frames.push(i * stepSize + oThis.startAngle);
	}

}

NIBS.CircleRun.prototype.start = function (percent) {

	var oThis = this;
	clearInterval(oThis.interval);

	oThis.animData.currFrame = 0;
	oThis.interval = setInterval(function () {
		if (oThis.mode === 'seconds') {
			oThis.paintClock();	
		}

		if (oThis.mode === 'animate') {
			oThis.animData.currFrame++;
			oThis.paintAnimation();	
		}

	}, 1000 / NIBS.CircleRun.fps);
}

NIBS.CircleRun.prototype.rev = function (percent) {

	var oThis = this;
	clearInterval(oThis.interval);

	oThis.animData.currFrame = oThis.animData.frames.length;
	oThis.interval = setInterval(function () {
		
		oThis.animData.currFrame--;
		if (oThis.animData.currFrame > -1 ) {
			oThis.paint(oThis.animData.frames[oThis.animData.currFrame]);
			oThis.runOnTick();
		} else {
			oThis.pause();
			oThis.runOnTick();
			oThis.onEnd();
			oThis.state = NIBS.CircleRun.states.at_start;
		}


	}, 1000 / NIBS.CircleRun.fps);
}

NIBS.CircleRun.prototype.runOnTick = function () {

	var oThis = this;

	oThis.onTick({
		progress: (oThis.animData.currFrame / oThis.animData.frames.length),
		angle: oThis.animData.frames[oThis.animData.currFrame],
		frame: oThis.animData.currFrame
	});

}

NIBS.CircleRun.prototype.paintAnimation = function () {

	var oThis = this;

	if (oThis.animData.frames.length > oThis.animData.currFrame) {
		oThis.paint(oThis.animData.frames[oThis.animData.currFrame]);
		oThis.runOnTick();
		oThis.state = NIBS.CircleRun.states.running;
	} else {
		oThis.pause();
		oThis.runOnTick();
		oThis.onEnd();
		oThis.state = NIBS.CircleRun.states.at_end;
		oThis.animData.currFrame = oThis.animData.frames.length - 1;
	}
};

NIBS.CircleRun.prototype.pause = function (percent) {

	var oThis = this;
	clearInterval(this.interval);
	oThis.state = NIBS.CircleRun.states.paused;
}


NIBS.CircleRun.prototype.destroy = function (percent) {
	var oThis = this;

	oThis.ctx.clearRect(0, 0, oThis.canvas.width, oThis.canvas.height);
	clearInterval(oThis.interval);
	oThis.state = NIBS.CircleRun.states.destroyed;
}

NIBS.CircleRun.prototype.widthFromPercent = function (percent) {

	var oThis = this,
		pr = percent.split('%').join(''),
		rv = (oThis.canvas.width / 2) * 0.1;

	if(!isNaN(pr)) {
		pr = parseFloat(pr) / 100;
		var rv = (oThis.canvas.width / 2) * pr;
		return rv;
	}
	return rv;

};


NIBS.CircleRun.prototype.drawArc = function (startFrom, endAt, o) {

	var oThis = this;

	o = o || {};
	oThis.ctx.beginPath();
	oThis.ctx.arc(oThis.canvas.width / 2, oThis.canvas.width / 2, oThis.canvas.width / 2 - (oThis._strokeWidth * 1.05 / 2), (startFrom - 90) * (Math.PI/180), (endAt - 90) * (Math.PI/180));
	oThis.ctx.strokeStyle = o.strokeStyle || oThis.strokeColor;
	oThis.ctx.lineWidth = o.lineWidth || 2;
	oThis.ctx.stroke();

};

NIBS.CircleRun.prototype.paintClock = function () {

	var oThis = this,
		d = new Date(), k = 360 / 60,
		seconds = d.getSeconds(),
		end = seconds * k + (k * d.getMilliseconds() / 1000);

	oThis.paint(end);

};


NIBS.CircleRun.prototype.reset = function () {

	var oThis = this;
	oThis.animData.currFrame = 0;
	oThis.paint(oThis.animData.frames[oThis.animData.currFrame]);
	oThis.state = NIBS.CircleRun.states.at_start;

};

NIBS.CircleRun.prototype.paint = function (angle) {

	//http://stackoverflow.com/questions/17861447/html5-canvas-drawimage-how-to-apply-antialiasing
	var oThis = this;
	oThis.ctx.clearRect(0, 0, oThis.canvas.width, oThis.canvas.height);

	if (oThis.baseColor !== 'transparent') {
		oThis.drawArc (oThis.startAngle, 360 + oThis.startAngle, {strokeStyle: oThis.baseColor, lineWidth: oThis._strokeWidth});
	}
	

	if (oThis.edgeColor) {
		var strokeWidth = oThis.edgeStrokeWidth;

		if (angle < oThis.startAngle + 2) {
			strokeWidth = strokeWidth / 2;
		}
		oThis.drawArc (oThis.startAngle - (strokeWidth), angle + strokeWidth, {strokeStyle: oThis.edgeColor, lineWidth: oThis._strokeWidth});	
	}
	
	oThis.drawArc (oThis.startAngle, angle, {lineWidth: oThis._strokeWidth});

};