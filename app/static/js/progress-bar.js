function ParticleFactory(app, direction, particleColor) {
	particle_config = {
		"alpha": {
			"start": 1,
			"end": 0
		},
		"scale": {
			"start": 0.1,
			"end": 0.01,
			"minimumScaleMultiplier": 1
		},
		"color": {
			"start": particleColor.toString(16),
			"end": "#FFFFFF"
		},
		"speed": {
			"start": 50,
			"end": 10,
			"minimumSpeedMultiplier": 1
		},
		"acceleration": {
			"x": 0,
			"y": 0
		},
		"maxSpeed": 0,
		"startRotation": {
			"min": -15,
			"max": 15
		},
		"noRotation": false,
		"rotationSpeed": {
			"min": 0,
			"max": 0
		},
		"lifetime": {
			"min": 0.5,
			"max": 1.5
		},
		"blendMode": "normal",
		"frequency": 0.001,
		"emitterLifetime": -1,
		"maxParticles": 500,
		"pos": {
			"x": 0,
			"y": 0
		},
		"addAtBack": false,
		"spawnType": "rect",
		"spawnRect": {
			"x": 0,
			"y": 0,
			"w": 3,
			"h": 3
		}
	}
    var emitter = null
    // Calculate the current time
    
	var elapsed = Date.now();

    var updateId;
    var update = function(){
	    updateId = requestAnimationFrame(update);
        var now = Date.now();
        if (emitter)
            emitter.update((now - elapsed) * 0.0025);
        
		elapsed = now;
    };

	// Create the new emitter and attach it to the stage
	var emitterContainer = new PIXI.Container();
	//app.stage.addChild(emitterContainer);

	var emitter = new PIXI.particles.Emitter(
		emitterContainer,
		//[PIXI.Texture.fromImage("/static/images/Sparks.png")],
		[PIXI.Texture.fromImage("/static/images/image.png")],
		particle_config
	);
	emitter.particleConstructor = PIXI.particles.PathParticle;
	
	update();

	return emitterContainer
};

function ProgressBarFactory(app, stPoint, edPoint, width, progressBarColor){
    var graphics = new PIXI.Graphics();
    graphics.beginFill(progressBarColor, 1);
	graphics.drawRect(0, 0, 1, 1)

	var startPoint = Point(stPoint.x * gCellSize, stPoint.y * gCellSize);
	var endPoint = Point(edPoint.x * gCellSize, edPoint.y * gCellSize);

    function distance(pointA, pointB){
        return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y))
	}
	
	function formTime(time){
		minute = Math.floor(time / 60)
		seconds = (time % 60)
		if (seconds <= 9)
			seconds = "0" + seconds.toString()
		return minute + ":" + seconds
	}

    var angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)


	var progressBarContainer = new PIXI.Container();

	var progressBar = new PIXI.Sprite(graphics.generateTexture());

    progressBar.x = startPoint.x
	progressBar.y = startPoint.y
	var length = distance(startPoint, endPoint);
	progressBar.scale.x = length;
    progressBar.scale.y = width;
	progressBar.rotation = angle;

	progressBar.start = startPoint;
	progressBar.end = endPoint;
	progressBarContainer.addChild(progressBar)
	progressBarContainer.progressBar = progressBar;

    progressBarContainer.extremity = ParticleFactory(
		app,
		progressBar.rotation,
		progressBarColor
	);

	progressBarContainer.addChild(progressBarContainer.extremity);
	progressBarContainer.extremity.rotation = angle
	progressBarContainer.extremity.x = endPoint.x
	progressBarContainer.extremity.y = endPoint.y
	progressBarContainer.extremity.visible = false

	var progressBarText = new PIXI.Text();  
	progressBarText.updText= function(text){
		//Todo,not such right, need fix
		progressBarText.setText(text);
		progressBarText.rotation = angle
		if (Math.PI * 0.5 < angle && angle < Math.PI * 1.5)
		{
			var unitX = (endPoint.x - startPoint.x) / length;
			var unitY = (endPoint.y - startPoint.y) / length;
			progressBarText.scale.x = -1;
			progressBarText.scale.y = -1;
			progressBarText.x = startPoint.x + unitX * progressBarText.width;
			progressBarText.y = startPoint.y + unitY * progressBarText.width;
		}
		else
		{
			progressBarText.x = startPoint.x;  
			progressBarText.y = startPoint.y;  
		}
	}
	progressBarText.updText('NaN/NaN');
	progressBarContainer.addChild(progressBarText);
	progressBarContainer.progressBarText = progressBarText;

	progressBarContainer.setActivate = function(active){
		this.extremity.visible = active;
	}
	//todo update set progress rate to set time
	progressBarContainer.setProgressRate = function(total_time_left, total_time){
		this.progressBarText.updText(formTime(total_time_left) + "/" + formTime(total_time));
		var rate = total_time_left / total_time;
		var newEnd = {
			x: this.progressBar.start.x + (this.progressBar.end.x - this.progressBar.start.x) * rate,
			y: this.progressBar.start.y + (this.progressBar.end.y - this.progressBar.start.y) * rate
		}

		this.progressBar.scale.x = distance(this.progressBar.start, newEnd)
		this.extremity.x = newEnd.x
		this.extremity.y = newEnd.y
	}

    return progressBarContainer;
}