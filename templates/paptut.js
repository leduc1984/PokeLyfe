paper.install(window);

function Character(x, y, id, color){
    this.color = color;
    this.new_pt = new Point(x, y);
    this.current_pt = this.new_pt.clone();
    this.id = id;
    this.path;
    this.draw(false);
    this.inc = 0;
    this.rast;
    this.dir;
    this.online = true;
}

Character.prototype.move = function(dx, dy){
    var xdist = this.new_pt.x - this.current_pt.x;
    var ydist = this.new_pt.y - this.current_pt.y;
    var moving = false;
    // Obviously needs some refactoring to get rid of
    // repetition
    if (Math.abs(xdist) > dx){
	moving = true;
	var face = xdist/Math.abs(xdist);
	this.current_pt.x += dx * face;
	if (face>0)
	    this.dir="right";
	else
	    this.dir="left";
    }
    if (Math.abs(ydist) > dy){
	moving = true
	var face = ydist/Math.abs(ydist);
	this.current_pt.y += dy * face;
	if (face>0)
	    this.dir="down";
	else
	    this.dir="up";
    }
    this.draw(moving);
}

Character.prototype.draw = function(moving){
    if (this.rast)
	this.rast.remove();
    if(!this.dir){
	this.dir = "down"
    }
    if(!moving)
	this.inc=0;
    var img = this.dir+(parseInt(this.inc%4)).toString();
    this.rast = new Raster(img, this.current_pt);
    this.rast.scale(4);
    this.inc+=0.125;
    
}

$(function(){
    var dx = 3;
    var dy = 3;
    paper.setup("mycanvas");
    var me;
    var start = true;
    var other_chars = {};
    var other_char_ids = new Array();
    other_chars.length = 0;
    var tool = new Tool();
    keysdown = {};
    tool.onKeyDown = function(event){
	keysdown[event.key] = true;
    }
    tool.onKeyUp = function(event){
	keysdown[event.key] = false;
    }

    function update(){
	$.ajax({
	    url:"update",
	    data:{
		x: me.current_pt.x,
		y: me.current_pt.y
	    }
	}).done(function(data){
	    for(i=0; i<data.length; i++){
		var character = other_chars[data[i].id];
		if (character){
		    if(data[i].online){
			character.new_pt.x = data[i].x;
			character.new_pt.y = data[i].y;
			character.online = true;
		    }else{
			character.rast.remove();
			character.online = false;
		    }
		}else{
		    other_chars[data[i].id] = new Character(data[i].x,
							    data[i].y,
							    data[i].id,
							    "blue");
		    other_char_ids.push(data[i].id);
		}
	    }
	});
    }
    function get_me(){
	$.ajax({
	    url:"get_me"
	}).done(function(data){
	    me = new Character(data.x, data.y, data.id, "red");
	});
    }
    
    function my_movement(){
	if(keysdown.left)
	    me.new_pt.x-=dx;
	if(keysdown.right)
	    me.new_pt.x+=dx;
	if(keysdown.up)
	    me.new_pt.y-=dy+1;
	if(keysdown.down)
	    me.new_pt.y+=dy;
	me.move(dx, dy);
    }
    
    view.onFrame = function (event){
    	if (me && start){
	    setInterval(update, 250);
	    start = false;
	}else if(me){
	    my_movement();
	}
	console.log("other_char_ids.length: "+other_char_ids.length);
    	for(j=0; j<other_char_ids.length; j++){
    	    var c = other_chars[other_char_ids[j]];
    	    if(c.online)
    	    	c.move(dx, dy);
    	}
	
    }
    get_me();
    tool.activate();
});
