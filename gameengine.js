var DWIDTH, DHEIGHT, SCALINGFACTOR, BANNERHEIGHT, GAMESPACE;
	var SIZES = {
		point     : 15,
		ball      : 0,
		pointsbar : 20,
		margin    : {
			x : 10,
			firstx : 10,
			y : 10
		},
		box       : 400,
		hexagon : {
			width  : 216,
			height : 249,
			top    : 220
		},
		cursor      : {
			size : 128,
			left : 44,
			top  : 65
		},
		flag : {}
	}
	var WALL   = 1,
		EMPTY  = 0,
		BALL   = 2,
		FILL   = 3;
	var levels = [];
	
	var N,
	  W,  E,
		S;
	N = 1;
	W = 2;
	E = 3;
	S = 4;

	var Game = {
		width      		: 6,//9 | 7
		height     		: 0,//6 | 9
		//objectsnum 		: 5,//6
		up				: false,
		map : [],
		lamps : [],
		lampspatch : [],
		logmap : function(){// выводит первоначальный массив в консоль
			for(y in this.map) {
				var str = "";
				for(x in this.map[y]) {
					str += this.map[y][x] + ' ';
				}
				console.log(str);
			}
		},
		objectsnum : 5,

		logarr2 : function(a){// выводит в консоль двумерный массив
			for(i in a) {
				var str = "";
				for(j in a[i]) {
					str += a[i][j] + ' ';
				}
				console.log(str);
			}
		},
		matchrepeat : function(c, direction, f) {
			f = (typeof(f) == 'undefined')?false:f;
			var aro = this.around6(c);
			//console.log(aro[direction]);
			var color = $('#x_y_' + c.x + '_' + c.y).data('color');
			if(f) {
				// remove element
				//console.log('remove');
				//$('#x_y_' + c.x + '_' + c.y).remove();
				//$('#x_y_' + c.x + '_' + c.y).append('X');
				$('#x_y_' + c.x + '_' + c.y).addClass('X');
			}
			if(aro[direction]) {
				if(aro[direction].color == color) {
					
					return this.matchrepeat(aro[direction], direction, f) + 1;
				}
			}
			return 0;
		},
		move : function(c, direction) {
			console.log('strt move');
			var aro = this.around6(c, true);
			var even = (aro[direction].y % 2 === 0);
			var _w = SIZES.hexagon.width;
			var _l = ( _w * aro[direction].x ) + (even?(_w / 2):0);
			var _t = (SIZES.hexagon.top / SIZES.hexagon.height * _w ) * aro[direction].y;
			$('#x_y_' + c.x + '_' + c.y).data({
				x : aro[direction].x,
				y : aro[direction].y
			});
			$('#x_y_' + c.x + '_' + c.y).attr('id', 'x_y_' + aro[direction].x + '_' + aro[direction].y);
			$('#x_y_' + aro[direction].x + '_' + aro[direction].y).animate({
				left : _l + 'px',
				top  : _t + 'px',
			});
			
		},
		fall : function() {
			console.log('---***---');
	//		$('.hexagon').each(function() {
	//			var c = $(this).data();
			var count = 0;
			for(y = Game.height; y--;) {
				var even = ((y % 2) === 0);
				for(x = Game.width - (even?1:0); x--;) {
					var c = {
						'x' : x,
						'y' : y
					}
					var aro0 = Game.around6(c);
					var aro1 = Game.around6(c, true);
					//sw, se
					if( $('#x_y_' + x + '_' + y).length ) {
						if(aro0.sw == false && aro1.sw != false) {
							count++;
							//console.log('fall:', c, 'sw');
							Game.move(c, 'sw');
						} else if(aro0.se == false && aro1.se != false) {
							count++;
							//console.log('fall:', c, 'se');
							Game.move(c, 'se');
						}
					}
				}
			}
			return count;	
		},
		matches : function(f) {
			f = (typeof(f) == 'undefined')?false:f;
			console.log('boobs');
			var count = 0;
			for(y = -1; ++y < Game.height;) {
				for(x = -1; ++x < Game.width;) {
					if( $('#x_y_' + x + '_' + y).length ) {
						var c = {
							'x' : x,
							'y' : y
						}
						var _we   = this.matchrepeat(c, 'w')  + this.matchrepeat(c, 'e');
						var _nwse = this.matchrepeat(c, 'nw') + this.matchrepeat(c, 'se');
						var _swne = this.matchrepeat(c, 'sw') + this.matchrepeat(c, 'ne');
						
						if( _we > 1 ) {
							if(f) {
								this.matchrepeat(c, 'w', true);
								this.matchrepeat(c, 'e', true);
							}
							count++;
						}
						if( _nwse > 1 ) {
							if(f) {
								this.matchrepeat(c, 'nw', true);
								this.matchrepeat(c, 'se', true);
							}
							count++;
						}
						if( _swne > 1 ) {
							if(f) {
								this.matchrepeat(c, 'sw', true);
								this.matchrepeat(c, 'ne', true);
							}
							count++;
						}
					}
				}
			}
			return count;
		},
		get1 : function(c, f) {
			if(f) {
				var even = ((c.y % 2) === 0);
				if( 
					c.y < 0 || c.y > this.height - 1 || 
					c.x < 0 || c.x > this.width - (even?2:1) 
				) {
					return false;
				}
				return {
					x : c.x, 
					y : c.y
				}
			}
			return ($('#x_y_' + c.x + '_' + c.y).length)?{
				x : c.x,
				y : c.y,
				color : $('#x_y_' + c.x + '_' + c.y).data('color')
			}:false;
		},
		fillemptyrand : function() {
			for(y = Game.height; y--;) {
				var even = ((y % 2) === 0);
				for(x = Game.width - (even?1:0); x--;) {
					//var c = {
					//	'x' : x,
					//	'y' : y
					//}
					if( $('#x_y_' + x + '_' + y).length == 0) {
						$('#map').append(this.draw6(x, y));
					}
				}
			}
			$('#points').html(POINTS);
			//$('#points').html(localStorage.match6points);
		},
		around6 : function(c, f) {
			f = (typeof(f) == 'undefined')?false:f;
			var even = ((c.y % 2) === 0);
			return {
				ne : this.get1({	x:c.x + (even?1:0)	, y:c.y - 1	}, f),
				e  : this.get1({	x:c.x + 1			, y:c.y		}, f),
				se : this.get1({	x:c.x + (even?1:0)	, y:c.y + 1	}, f),
				sw : this.get1({	x:c.x - (even?0:1)	, y:c.y + 1	}, f),
				w  : this.get1({	x:c.x - 1			, y:c.y		}, f),
				nw : this.get1({	x:c.x - (even?0:1)	, y:c.y - 1	}, f)
			}
		},
		warp : function(a, b, f) {
			
			$('#x_y_' + a.x + '_' + a.y)
				.data({'x':b.x,'y':b.y})
				.css({
					left : ( SIZES.column * b.x + SIZES.margin.x ),
					top  : ( SIZES.column * b.y + SIZES.margin.y )
				});
			$('#x_y_' + b.x + '_' + b.y)
				.data({'x':a.x,'y':a.y})
				.css({
					left : ( SIZES.column * a.x + SIZES.margin.x ),
					top  : ( SIZES.column * a.y + SIZES.margin.y )
				});
			// a <=> b #id
			$('#x_y_' + a.x + '_' + a.y).attr('id', 'tmp');
			$('#x_y_' + b.x + '_' + b.y).attr('id', 'x_y_' + a.x + '_' + a.y);
			$('#tmp').attr('id', 'x_y_' + b.x + '_' + b.y)
			
			if(typeof(f) != 'undefined') {
				// animate position.a <=> position.b
				var _a = $('#x_y_' + a.x + '_' + a.y).position();//.offset()
				var _b = $('#x_y_' + b.x + '_' + b.y).position();
				$('#x_y_' + a.x + '_' + a.y).animate({
					left : _b.left + 'px',
					top : _b.top + 'px'
				});
				$('#x_y_' + b.x + '_' + b.y).animate({
					left : _a.left + 'px',
					top : _a.top + 'px'
				}, function() {
				
					Game.matches(true);
					//var l = $('.X').length;
					//console.log('L0:', l);
					
					//$('.X').hide('slow',function(i){
					$('.X').animate({
						width    : '0px',
						height   : '0px',
						//complete :  function() {
						//	console.log('+++boobs+++');
						//} 
					}, function(){
						//localStorage.match6points = parseInt(localStorage.match6points) + 1;
						$(this).remove();
						POINTS++;
						Game.iswin();
					});
					setTimeout(
						function() {
							for(;Game.fall(););
							//console.log('+++boobs+++');
							setTimeout(
								function() {
									Game.fillemptyrand();
								},
								500
							);
						}, 
						500
					);
					
					//console.log('---');
					//Game.matches(true);
				});
			}
		},
		iswin : function(c) {
			//if( POINTS === levels[Game.level] ) {
			if( POINTS === this.mappoints[parseInt(localStorage.match6level)].points ) {
				this.win();
				//return true;
			}
			//return false;
		},
		draw6 : function(x, y){//j, i
			var even = (y % 2 === 0);
			var w = SIZES.hexagon.width;
			var h = SIZES.hexagon.height;
			var _l = ( w * x ) + (even?(w / 2):0);
			var _t = (SIZES.hexagon.top / SIZES.hexagon.height * w ) * y;//top :)
			var _r = (Math.random() * this.objectsnum + 1)|0;
			var l = $('<div>')
				.attr('id', ( 'x_y_' + x + '_' + y) )
				.addClass('hexagon')
				.addClass('e' + _r)
				.data({
					'x' : x,
					'y' : y,
					color : _r
				})
				.css({
					left   : _l,
					top    : _t,
					width  : w,
					height : h,
				})
			return l;
		},
//fixfix2
/*
		drawarrow : function(c, direction){//j, i
			console.log('draw arrow ' + direction, c.x, c.y);
			var even = (c.y % 2 === 0);
			var w = ( SIZES.hexagon.width / SIZES.hexagon.height * SIZES.ball );
			var h = SIZES.ball;
			var _l = ( SIZES.margin.x + (w * c.x) ) + (even?(w / 2):0);
			var _r = (SIZES.hexagon.top / SIZES.hexagon.height * SIZES.ball ) * c.y;
			var l = $('<div>')
				.addClass('hexagon')
				.attr('id', 'arrow_' + direction)
				.addClass('arrow')
				.data({
					'x' : c.x,
					'y' : c.y
				})
				.css({
					left   : _l,
					top    : _r,
					width  : w,
					height : h,
				})
			return l;
		},
*/
/*
		drawarrows : function(c){
			$('#map>.arrow').remove();
			c.x = parseInt(c.x);
			c.y = parseInt(c.y);
			console.log('draw arrows');
			var around = this.emptyaround(c);
			var even = (c.y % 2 === 0);
			if(around.a) {
				$('#map').append(this.drawarrow({x : c.x - (even?0:1), y : c.y - 1}, 'nw'));
			}
			if(around.b) {
				$('#map').append(this.drawarrow({x : c.x + (even?1:0), y : c.y - 1}, 'ne'));
			}
			if(around.c) {
				$('#map').append(this.drawarrow({x : c.x - 1, y : c.y}, 'w'));
			}
			if(around.d) {
				$('#map').append(this.drawarrow({x : c.x + 1, y : c.y}, 'e'));
			}
			if(around.e) {
				$('#map').append(this.drawarrow({x : c.x - (even?0:1), y : c.y + 1}, 'sw'));
			}
			if(around.f) {
				$('#map').append(this.drawarrow({x : c.x + (even?1:0), y : c.y + 1}, 'se'));
			}
			$('#arrow_nw').click(function(){
				Game.runnw(c);
				console.log('run north-west');
			});
			$('#arrow_ne').click(function(){
				Game.runne(c);
				console.log('run north-east');
			});
			$('#arrow_w').click(function(){
				Game.runw(c);
				console.log('run west');
			});
			$('#arrow_e').click(function(){
				Game.rune(c);
				console.log('run east');
			});
			$('#arrow_sw').click(function(){
				Game.runsw(c);
				console.log('run south-west');
			});
			$('#arrow_se').click(function(){
				Game.runse(c);
				console.log('run south-east');
			});
		},
*/
/*
		drawball : function(c){//j, i
			console.log('drawball');
			var even = (c.y % 2 === 0);
			var w = ( SIZES.hexagon.width / SIZES.hexagon.height * SIZES.ball );
			var s = ( SIZES.ball / SIZES.hexagon.height * SIZES.cursor.size );
			var _ml = ( SIZES.ball / SIZES.hexagon.height * SIZES.cursor.left );
			var _mt = ( SIZES.ball / SIZES.hexagon.height * SIZES.cursor.top );
			console.log(w, s);
			var _l = ( SIZES.margin.x + (w * c.x) ) + (even?(w / 2):0) + _ml;
			var _t = (SIZES.hexagon.top / SIZES.hexagon.height * SIZES.ball ) * c.y + _mt;
			var l = $('<div>')
				//.addClass('ball')
				.attr('id', 'ball')
				.data({
					'x' : c.x,
					'y' : c.y
				})
				.css({
					left   : _l,
					top    : _t,
					width  : s,
					height : s,
				})
			return l;
		},
*/
		randmap : function(){ // рандомно забивает кату
/*
			for(var i = 0; i < this.height; i++) {
				this.map[i] = [];
				for(var j = 0; j < this.width; j++) {
					this.map[i][j] = (Math.random() * this.objectsnum + 1)|0;
				}
			}
*/
			for(var y = 0; y < Game.height; y++) {
				var even = ( (y % 2) === 0 );
				this.map[y] = [];
				for(var x = 0; x < Game.width - (even?1:0); x++) {
					this.map[y][x] = (Math.random() * this.objectsnum + 1)|0;
				}
			}
		},
		mappoints : [//320x480
// document.onclick = function(e){console.log(e.pageX + ' ' + e.pageY)}	
			{ x : 47,  y : 440, points : 100 , index : 1 },
			{ x : 66,  y : 369, points : 300 , index : 2 },
			{ x : 107, y : 306, points : 1000 , index : 3 },
			{ x : 159, y : 251, points : 3000 , index : 4 },
			{ x : 192, y : 185, points : 5000 , index : 5 }
		],
		drawmap : function(){
			$('#mapsplash').html('');
			//$('#mapsplash').append(' drawmap');
			for(i in this.mappoints){
				//draw point
				
				var l = $('<div>')
					
				//console.log(parseInt(localStorage['atlaslevel']) + ' ' + i);
				if(parseInt(localStorage['match6level']) == i) {
					$(l).attr('id', 'thislevel');
				}
				if(parseInt(localStorage['match6level']) >= i) {
					$(l)
						.addClass('inhistory')
						.addClass('buttn')
						.addClass('e' + this.mappoints[i].index)
						.css({
							left : this.mappoints[i].x * SCALINGFACTOR - SIZES.flag.x / 2,// * на коэффициент масштабирования
							top : this.mappoints[i].y * SCALINGFACTOR - SIZES.flag.x / 2,
							width : SIZES.flag.x,
							height : SIZES.flag.y
						});
						
				}
					
				/*
				if(parseInt(localStorage['match6level']) == i) {
					$(l)
						//.removeClass('buttn');
				} else {
				
				}
				*/
				//$(l).html(i);
				$('#mapsplash').append(l);
				//$('#mapsplash').append(' button');
			}
			$('#thislevel').click(function(){
				$('#mapsplash').hide();
				$('#gamescreen').show();
				Game.startgame();
			});
		},
		draw : function(){
			console.log('start draw');
			$('#map').html('');
			for(var y = 0; y < Game.height; y++) {
				var even = ( (y % 2) === 0 );
				for(var x = 0; x < Game.width - (even?1:0); x++) {
			//for(y in Game.map) { for(x in Game.map[y]) {
					$('#map').append(this.draw6(x, y));
				}
			}

			$("#map").delegate(".hexagon", "click", function() {
			
				if(Game.up == false) {// первый клик
					if(Game.debug_click) {return;}
					console.log('click1');
					$(this).addClass('selected');
					Game.up = {
						x : $(this).data().x,
						y : $(this).data().y,
						o : this
					}
				} else {
					//Game.debug_click = true;
					console.log('click2');
					$(Game.up.o).removeClass('selected');
//					console.log('Game.up:', Game.up);
					// нельзя менять те что не рядом
					var aro = Game.around6(Game.up);
					var c = {
						x : $(this).data().x,
						y : $(this).data().y
					}
					//TODO
					
					
					if( 
						( c.x == aro.ne.x && c.y == aro.ne.y ) || 
						( c.x == aro.e .x && c.y == aro.e .y ) || 
						( c.x == aro.se.x && c.y == aro.se.y ) || 
						( c.x == aro.sw.x && c.y == aro.sw.y ) || 
						( c.x == aro.w .x && c.y == aro.w .y ) || 
						( c.x == aro.nw.x && c.y == aro.nw.y )
					) {
						console.log('around!');
						// нельзя менять одинаковые
						if( 
							$('#x_y_' + c.x + '_' + c.y).data().color != 
							$('#x_y_' + Game.up.x + '_' + Game.up.y).data().color 
						) {
							// нельзя менять если нет выигрыша
							Game.warp(c, Game.up);
							var count = Game.matches();
							Game.warp(c, Game.up);
							if( count > 0) {
								Game.warp(c, Game.up, true);
							}
						}
					} else {
						console.log('not around');
					}
					Game.up = false;
				}
			});
		},
		win : function() {
			$('#splash').html(words.youwin);
			$('#shadow').show();
			$('#splash').show();
			//$('#gamescreen').hide();
			var l = parseInt(localStorage.match6level);
			if( l < this.mappoints.length - 1 ) {
				localStorage.match6level = l + 1;
				setTimeout(function() {
					Game.startgame();
					$('#splash').hide();
				}, 3000);
			}
		},
		gameover : function() {
			$('#splash').html(words.gameover);
			$('#splash').show();
			setTimeout(function() {
				$('#shadow').hide();
				$('#splash').hide();
				Game.startgame();
			}, 3000);
		},
		startgame : function(){
			POINTS = 0;
			//this.randmap();
			
			$('#points').html(POINTS);
			//$('#points').html(localStorage['match6points']);
			$('#level').html(parseInt(localStorage['match6level']) + 1);
			
			// для каждой новой карты (другого размера)
			var l = parseInt(localStorage['match6level']);
			//Game.level = l;
//			this.map = [];
//			for(y in levels[l].map) {
//				this.map[y] = [];
//				for(x in levels[l].map[y]) {
//					this.map[y][x] = levels[l].map[y][x];
//				}
//			}
			//this.map = levels[l].map;
			
			var mapsize = {
				x : Game.width,//Game.map[1].length,
				y : Game.height//Game.map.length
			}

			if(mapsize.x > mapsize.y){
				SIZES.ball = GAMESPACE.X / mapsize.x;
			} else {
				if( GAMESPACE.X / mapsize.x * mapsize.y > GAMESPACE.Y ){
					SIZES.ball = GAMESPACE.Y / mapsize.y;
				} else {
					SIZES.ball = GAMESPACE.X / mapsize.x;
				}
			}
			$('#map').css({
				left   : SIZES.margin.firstx * SCALINGFACTOR,//( SIZES.margin.x * SCALINGFACTOR ),
				top    : ( SIZES.margin.y * SCALINGFACTOR + SIZES.pointsbar * SCALINGFACTOR ),
				width  : GAMESPACE.X,
				height : GAMESPACE.Y//, border : '1px solid #f00'
			});
			//SIZES.margin.x = ( ( DWIDTH - (SIZES.ball * mapsize.x) ) / 2 - SIZES.margin.x * SCALINGFACTOR);
			var s = ( SIZES.hexagon.width / SIZES.hexagon.height * SIZES.ball );
			SIZES.margin.x = ( ( DWIDTH - (s * mapsize.x) ) / 2 ) - SIZES.margin.firstx;
			console.log(SIZES.margin.x);
			// ----------------------------------------
			this.draw();
		},
		initmatchesarr : function() {
			//this.mathes = [];
			for(y in this.map){
				this.matches[y] = []
				for(x in this.map[y]) {
					this.matches[y][x] = 0;
				}
			}
		},
		initfallarr : function() {
			//this.mathes = [];
			for(y in this.map){
				this.fall[y] = []
				for(x in this.map[y]) {
					this.fall[y][x] = 0;
				}
			}
		},
		clearmatchesarr : function() {
			for(y in this.map){
				for(x in this.map[y]) {
					this.matches[y][x] = 0;
				}
			}
		},
		clearfallarr : function() {
			for(y in this.map){
				for(x in this.map[y]) {
					this.fall[y][x] = 0;
				}
			}
		},
		resetall : function() {
			localStorage.match6level = 0;
		},
		init : function(){
			//$('#mapsplash').append(' in');
			if(
				typeof(localStorage['match6level']) === 'undefined'// ||
//				typeof(localStorage['match6points']) === 'undefined'
			){
				localStorage['match6level'] = 0;
//				localStorage['match6points'] = 0;
			}
			//$('#points').html(localStorage['hexagonpoints']);
			//$('#level').html(localStorage['hexagonlevel']);
			//this.drawmap();
		}
	}
//----------------------------------------------------------------------------------------------------------------------------------------------------
	$(document).ready(function(){
		Game.init();
		DWIDTH = document.body.clientWidth;
		DHEIGHT	= document.body.clientHeight;
		SCALINGFACTOR = DWIDTH / 320;
		BANNERHEIGHT = SCALINGFACTOR * 50;
		SIZES.margin.x = SIZES.margin.x * SCALINGFACTOR;
		SIZES.margin.y = SIZES.margin.y * SCALINGFACTOR;
		
		GAMESPACE = {
			X : DWIDTH - ( SIZES.margin.x * 2 ),
			Y : DHEIGHT - BANNERHEIGHT - SIZES.margin.y - SIZES.pointsbar
		}
		$('#splash').css('width', (DWIDTH - 30 + 'px'));
		SIZES.flag = {
			x : 30 * SCALINGFACTOR,
			y : 35 * SCALINGFACTOR
		}
		$('#pointsbar').css({
			height        : ( ( ( SIZES.pointsbar * SCALINGFACTOR )|0 ) + 'px' ),
			'line-height' : ( ( ( SIZES.pointsbar * SCALINGFACTOR )|0 ) + 'px' )
		});
		var _gw = (GAMESPACE.X / Game.width)|0;//SIZES.hexagon.width
		var _gh = (SIZES.hexagon.height / SIZES.hexagon.width * _gw)|0;
		var _gt = (SIZES.hexagon.top / SIZES.hexagon.height * _gh)|0;
		SIZES.hexagon.width = _gw;
		SIZES.hexagon.height = _gh;
		SIZES.hexagon.top = _gt;
		console.log(_gw,_gh,_gt);
		
		Game.height = ((GAMESPACE.Y - (SIZES.hexagon.height - SIZES.hexagon.top)) / SIZES.hexagon.top)|0;
		
		//Game.startgame();
		
/*		$('#playbutton').css({
			width : (216 * SCALINGFACTOR) + 'px',
			height : (72 * SCALINGFACTOR) + 'px',
			left : (DWIDTH / 2 - 108 * SCALINGFACTOR) + 'px',
			bottom : 150 * SCALINGFACTOR
		})
		.click(function(){
			$('#gamescreen').show();
			$('#startscreen').hide();
			Game.startgame();
		});
*/
		var _l, _t, _w, _h;
		_w = (206 * SCALINGFACTOR) + 'px';//548
		_h = (88 * SCALINGFACTOR);//247
		_l = (DWIDTH / 2 - 103 * SCALINGFACTOR) + 'px';
		//_t = 270 * SCALINGFACTOR;
		_t = 620 / 1280 * DHEIGHT
		$('#startscreen>div:eq(0)').css({left:_l,top:(_t + 'px'),width:_w,height:_h + 'px'});
		_t += _h + 3;
		$('#startscreen>div:eq(1)').css({left:_l,top:(_t + 'px'),width:_w,height:_h + 'px'});
		
		$('#newgame').click(function(){
			Game.resetall();
			$('#startscreen').hide();
			$('#mapsplash').show();
			Game.drawmap();
		});
		$('#continue').click(function(){
			$('#startscreen').hide();
			$('#mapsplash').show();
			Game.drawmap();
		});
	});