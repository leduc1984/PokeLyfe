paper.install(window);

var me, other_chars, other_char_ids;

function SpeechBubble(id, char_id, text, time_left){
    this.id = id;
    this.char_id = char_id;
    this.text = text;
    this.group;
    this.draw();
    var self = this;
    setTimeout(function(){
	self.group.remove();
    }, time_left); // time_left is in milliseconds
}

SpeechBubble.prototype.draw = function(){
    if (!this.group){
	this.group = new Group();
	if (this.char_id == me.id)
	    var character = me;
	else
	    var character = other_chars[this.char_id];
	var bubble = new Path.Rectangle(new Rectangle(character.current_pt.x + 25,
						      character.current_pt.y - 150,
						      200,
						      100));
	bubble.strokeColor = "black";
	this.group.addChild(bubble);
	var message = new PointText(new Point(bubble.position.x + 5,
					      bubble.position.y + 5));
	message.content = this.text;
	this.group.addChild(message);
    }
}

SpeechBubble.prototype.move = function(dx, dy){
    this.group.setPosition(this.group.position.x+dx,
			   this.group.position.y+dy);
}

SpeechBubble.prototype.kill = function(){
    this.group.remove();
}

function Character(x, y, id, color){
    /*
      Constructor for Character object
      I'm going to keep the color parameter for now
      because it may evolve into a way to differentiate between
      this user's sprite and the other users' sprites
    */
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
    this.sb_obj = {};
    this.speech_bubbles = new Array();
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
	this.speech_bubbles.forEach(function(e){e.move(dx * face, 0);});
	if (face>0)
	    this.dir="right";
	else
	    this.dir="left";
    }
    if (Math.abs(ydist) > dy){
	moving = true
	var face = ydist/Math.abs(ydist);
	this.current_pt.y += dy * face;
	this.speech_bubbles.forEach(function(e){e.move(0, dy * face);});
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
    // alert($("body").width());
    var margin = $("body").css("margin");
    margin = parseInt(margin.substring(0, margin.length-2));
    $("#mycanvas")
	.attr("width", $(window).width() - 100)
	.attr("height", $(window).height() - 150);
    // Need to add some onresize handler
    paper.setup("mycanvas");
    // var me;
    var start = true;
    other_chars = {};
    other_char_ids = new Array();
    other_chars.length = 0;
    var tool = new Tool();
    keysdown = {};
    tool.onKeyDown = function(event){
	keysdown[event.key] = true;
    }
    tool.onKeyUp = function(event){
	keysdown[event.key] = false;
    }

    function get_csrf(){
	var c = document.cookie;
	var csrf = "csrftoken=";
	var i = c.search(csrf)+csrf.length;
	var x = c.substring(i, c.length);
	var csrf_value = x.substring(0, x.search(";"));
	return csrf_value;
					
    }

    function update_my_position(){
	$.ajax({
	    url:"update",
	    data:{
		x: me.current_pt.x,
		y: me.current_pt.y,
		csrfmiddlewaretoken: get_csrf()
	    },
	    type:"POST"
	});
    }

    function retrieve_other_chars(){
	$.ajax({
	    url:"other_chars"
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

    function start_updates(){
	update_my_position();
	retrieve_other_chars();
    }
   
    function get_me(){
	$.ajax({
	    url:"get_me"
	}).done(function(data){
	    me = new Character(data.x, data.y, data.id, "red");
	    me.speech_bubbles.push(new SpeechBubble(1, 1, "HALLO", 5000));
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
	    // setInterval(update, 250);
	    setInterval(start_updates, 250);
	    // setInterval(retrieve_other_chars, 100);
	    start = false;
	}else if(me){
	    my_movement();
	}
    	for(j=0; j<other_char_ids.length; j++){
    	    var c = other_chars[other_char_ids[j]];
    	    if(c.online)
    	    	c.move(dx, dy);
    	}
	
    }
    get_me();
    tool.activate();
});
