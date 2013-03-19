paper.install(window);

var me, other_chars, other_char_ids, get_csrf;

function print_lines(group, line_list, x0, y0){
    var char_height = 15;
    line_list.forEach(function(line){
	var message = new PointText(new Point(x0, y0));
	message.content = line;
	message.paragraphStyle.justification = "left";
	group.addChild(message);
	y0 += char_height;
    });
    
}

function break_lines(max_width, message){
    var char_width = 8;
    var LINE_LENGTH = Math.floor(max_width/char_width);
    var word_list = message.split(" ");
    console.log(word_list.length);
    var i = 0;
    var line;
    var line_list = new Array();
    while(i < word_list.length){
	line = '';
	console.log(line.length);
	console.log(word_list[i].length);

	while(i < word_list.length){
	    console.log(line.length);
	    console.log(word_list[i].length);
	    if (line.length + word_list[i].length <= LINE_LENGTH){
		line += word_list[i]+ " ";
		i++;
	    }else if(line.length > 0 && line.length + word_list[i].length > LINE_LENGTH){
		break;
	    }else if(line.length == 0){
		line += word_list[i].substring(0, LINE_LENGTH);
		word_list[i] = word_list[i].substring(LINE_LENGTH, word_list[i].length);
		break;
	    }
	    
	}
	line_list.push(line);
	
    }
    console.log("got all the way here");
    return line_list;
}

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
	var b_rect = new Rectangle(new Point(character.current_pt.x + 25,
					     character.current_pt.y - 150),
				   new Size(200,
					    100));
	var bubble = new Path.Rectangle(b_rect);
	bubble.strokeColor = "black";
	this.group.addChild(bubble);
	print_lines(this.group,
		    break_lines(300, this.text),
		    bubble.position.x-90,
		    bubble.position.y-35);
	// var message = new PointText(new Point(bubble.position.x,
	// 				      bubble.position.y));
	// message.content = this.text;
	// // message.bounds = bubble.bounds;
	// message.paragraphStyle.justification="right";
	// this.group.addChild(message);
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

function send_message(text, recipients){
    me.speech_bubbles.push(new SpeechBubble(99,
					    me.id,
					    text,
					    15000));
    $.ajax({
	url:"send_message",
	data:{
	    text: text,
	    recipients: recipients,
	    csrfmiddlewaretoken: get_csrf()},
	type:"POST"
    });
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

    get_csrf = function (){
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

    function display_messages(character, messages){
	var x;
	for(x=0; x<messages.length; x++){
	    var m = messages[x];
	    if(!character.sb_obj[m.id]){
		character.sb_obj[m.id] = true;
		character.speech_bubbles.push(new SpeechBubble(m.id,
							       character.id,
							       m.text,
							       m.time_left));
	    }
	}
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
		    character =
			other_chars[data[i].id] = new Character(data[i].x,
								data[i].y,
								data[i].id,
								"blue");
		    other_char_ids.push(data[i].id);
		}
		display_messages(character, data[i].messages);
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
	    display_messages(me, data.messages);
	    // me.speech_bubbles.push(new SpeechBubble(1, 1, "HALLO", 5000));
	    // var x;
	    // for(x=0; x<data.messages.length; x++){
	    // 	var m = data.messages[x];
	    // 	me.sb_obj[m.id] = true;
	    // 	me.speech_bubbles.push(new SpeechBubble(m.id, me.id, m.text, m.time_left));
	    // }
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

    var first_focus = true;
    $("#message").keydown(function(event){
	if(event.which == 13){
	    send_message($("#message").val(), "all");
	    $("#message").val("Send another message!");
	    first_focus = true;
	    $(this).blur();
	    $("#mycanvas").focus();
	}
    }).focus(function(event){
	if (first_focus){
	    $(this).val("");
	    first_focus = false;
	}
    });
    ;
    
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
