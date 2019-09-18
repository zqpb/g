var w = window;
	w.tick = 100;
	w.time = 0;

	w.load = function ()
	{
		w.onmousedown = g.update;

		w.onmousemove = g.update;

		w.onmouseup = g.update;

		w.onresize = function (event)
		{
			c.resize ();
			g.update (event);
			g.redraw ();
		}

		w.ontick ();
	}

	w.ontick = function ()
	{
		w.setInterval
		(
			function ()
			{
				w.time += w.tick;
				g.update ({ type: 'tick' });
				g.draw ();
			},
			w.tick
		);
	}

var c = w.document.createElement ('canvas');
	c.c = c.getContext ('2d');

	c.load = function ()
	{
		c.resize ();
		w.document.body.appendChild (c);
	}

	c.resize = function ()
	{
		c.height = w.innerHeight;
		c.width = w.innerWidth;
	}

var g =
{
	c:
	{
		box: function (_)
		{
			let box = g.c.object (_);
				box.c = _.c || '#fff';
				box.h = _.h || 100;
				box.redraw = _.redraw || 1;
				box.w = _.w || 100;
				box.x = _.x || 0;
				box.y = _.y || 0;
				box.z = _.z || 0;

				box.draw = function ()
				{
					c.c.fillStyle = box.c;
					c.c.fillRect (box.x, box.y, box.w, box.h);
				}

				return box;
		},

		button: function (_)
		{
			let button = g.c.sprite (_);
				button.action = _.action || function () {};
				button.in = _.in || function () {};
				button.out = _.out || function () {};
				button.over = 0;
			
				button.active = function (event)
				{
					if (button.over)
					{
						if (!g.g.pib ({ x: event.x, y: event.y }, button))
						{
							button.over = 0;
							c.style.cursor = 'default';
							button.out ();
						}
					}
					else
					{
						if (g.g.pib ({ x: event.x, y: event.y }, button))
						{
							button.over = 1;
							c.style.cursor = 'pointer';
							button.in ();
						}
					}
				}

				button.mousedown = function (event)
				{
					if (g.g.pib ({ x: event.x, y: event.y }, button))
					{
						button.action ();
					}
				}

				button.mousemove = function (event)
				{
					button.active (event);
				}

				button.mouseup = function (event)
				{
					button.over = 0;
					button.active (event);
				}

			return button;
		},

		object: function (_)
		{
			let object = _ || {};
				object.id = _.id || g.id++;

				object.load = function ()
				{
					g.o[object.id] = object;
				}

			return object;
		},

		sprite: function (_)
		{
			let sprite = g.c.box (_);
				sprite.h = _.h || _.i.clientHeight;
				sprite.i = _.i;
				sprite.w = _.w || _.i.clientWidth;

				sprite.draw = function ()
				{
					c.c.drawImage (sprite.i, sprite.x, sprite.y, sprite.w, sprite.h);
				}

			return sprite;
		}
	},

	draw: function ()
	{
		let z = 0;
		let Z = g.g.zmax ();
		for (let z = 0; z <= Z; z++)
		{
			for (let id in g.o)
			{
				if (g.o[id].z == z)
				{
					if (g.o[id].redraw)
					{
						g.o[id].redraw = 0;
						g.o[id].draw ();
					}
				}
			}
		}
		//console.log ('draw');
	},

	g:
	{
		set images (i)
		{
			for (let n of i)
			{
				let image = new Image ();
					image.src = 'data/' + n + '.png';
				g.i[n] = image;
			}
		},

		pib: function (p, b)
		{
			//check point in box
			return ((p.x > b.x) && (p.x < b.x + b.w) && (p.y > b.y) && (p.y < b.y + b.h));
		},

		r: function (a, b)
		{
			return Math.random () * (b - a) + a;
		},

		ra: function (a)
		{
			let i = Math.floor (Math.random () * (a.length));
			return a[i];
		},

		get rc ()
		{
			return '#' + ((1<<24)*Math.random()|0).toString(16);
		},
		
		rz: function (a, b)
		{
			return Math.floor (Math.random () * (b - a + 1)) + a;			
		},

		zmax: function ()
		{
			let z = 0;
			for (let id in g.o)
			{
				if (g.o[id].z > z)
				{
					z = g.o[id].z;
				}
			}
			return z;
		}
	},

	i: {},

	id: 0,

	load: function ()
	{
		w.load ();
		c.load ();

	},

	o: [],

	redraw: function ()
	{
		let z = 0;
		let Z = g.g.zmax ();
		for (let z = 0; z <= Z; z++)
		{
			for (let id in g.o)
			{
				if (g.o[id].z == z)
				{
					g.o[id].draw ();
				}
			}
		}
		//console.log ('draw');
	},

	update: function (event)
	{
		let type = event.type;
		for (let o of g.o)
		{
			if (o[type])
			{
				o[type] (event);
			}
		}
	},

	wipe: function ()
	{
		g.id = 0;
		g.o = [];
		c.c.clearRect (0, 0, w.innerWidth, w.innerHeight);
		c.style.cursor = 'default';
	}
}

w.onload = g.load;

g.g.images =
[
	'press',
	'press_action',
	'press_hover',
	'test'
];

let red = g.c.box ({ c: '#f00', x: 100, y: 100, z: 1 });
	red.load ();
g.c.box ({ c: '#0f0', x: 120, y: 120, z: 1 }).load ();

g.c.sprite ({ i: g.i.test, x: 200, y: 200 }).load ();

g.c.button
({
	action: function ()
	{
		this.i = g.i.press_action;
		this.redraw = 1;
		red.c = g.g.rc;
		red.redraw = 1;
		g.draw ();
		console.log ('click');
	},
	i: g.i.press,
	in: function ()
	{
		this.i = g.i.press_hover;
		this.redraw = 1;
	},
	out: function ()
	{
		this.i = g.i.press;
		this.redraw = 1;
	},
	x: 300,
	y: 100
}).load ();