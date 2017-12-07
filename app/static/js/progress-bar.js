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
	app.stage.addChild(emitterContainer);

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

function ProgressBarFactory(app, startPoint, endPoint, width, progressBarColor){
    var graphics = new PIXI.Graphics();
    graphics.beginFill(progressBarColor, 1);
    graphics.drawRect(0, 0, 1, 1)

    function distance(pointA, pointB){
        return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y))
    }
    
    function anchor(startPoint, endPoint){
        return Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)
    }

	var progressBar = new PIXI.Sprite(graphics.generateTexture());

    progressBar.x = startPoint.x
	progressBar.y = startPoint.y
    progressBar.scale.x = distance(startPoint, endPoint);
    progressBar.scale.y = width
    progressBar.rotation = anchor(startPoint, endPoint)


	progressBar.start = startPoint
	progressBar.end = endPoint

    progressBar.extremity = ParticleFactory(
		app,
		progressBar.rotation,
		progressBarColor
	);
    progressBar.extremity.rotation = anchor(startPoint, endPoint)
	progressBar.extremity.x = endPoint.x
	progressBar.extremity.y = endPoint.y
	progressBar.extremity.visible = false

	progressBar.activate = function(){
		this.extremity.visible = true
	}
	progressBar.deactivate = function(){
		this.extremity.visible = false
	}
	progressBar.setProgressRate = function(rate){
		var newEnd = {
			x: this.start.x + (this.end.x - this.start.x) * rate,
			y: this.start.y + (this.end.y - this.start.y) * rate
		}

		this.scale.x = distance(this.start, newEnd)
		this.extremity.x = newEnd.x
		this.extremity.y = newEnd.y
	}

    return progressBar;
}