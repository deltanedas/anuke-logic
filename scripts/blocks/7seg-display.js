const getbits = c => {
	switch (c) {
	// Decimal digits
	case '0': case 'D': case 'O': return 0b1110111;
	case '1': case 'I': return 0b0100100;
	case '2': return 0b1011101;
	case '3': return 0b1101101;
	case '4': return 0b0101110;
	case '5': case 's': case 'S': return 0b1101011;
	case '6': return 0b1111011;
	case '7': return 0b0100101;
	case '8': case 'B': return 0b1111111;
	case '9': case 'g': return 0b1111011;

	// Extra characters
	case 'a': return 0b1111101; case 'A': return 0b0111111;
	case 'b': return 0b1111010; /* B is 8 */
	case 'c': return 0b1011000; case 'C': return 0b1010011;
	case 'd': return 0b1111100; /* D is 0 */
	case 'e': return 0b1011111; case 'E': return 0b1011011;
	case 'f': return 0b0011011; case 'F': return 0b0011011;
	/* g is 9 */ case 'G': return 0b1110011;
	case 'h': return 0b0111010; case 'H': return 0b0111110;
	case 'i': return 0b0100000; /* I is 1 */
	case 'j': return 0b1100000; case 'J': return 0b1101000;
	// no k
	case 'l': return 0b0010010; case 'L': return 0b1010010;
	// no m
	case 'n': return 0b0111000; case 'N': return 0b0110110;
	case 'o': return 0b1111000; /* O is 0 */
	case 'p': case 'P': return 0b0011111;
	case 'q': return 0b0101111; /* no Q */
	case 'r': return 0b0011000; /* no R */
	// s/S are 5
	case 't': return 0b1011010; /* no T - flipped L would look wrong */
	case 'u': case 'v': return 0b1110000; case 'U': case 'V': return 0b1110110;
	/* no w/W, x/X, y/Y, z/Z */
	}

	// character can't be represented
	return 0;
};

const mask = 0b1111111;

const disp = extendContent(Block, "7seg-display", {
	load() {
		this.super$load();
		this.segments = [];
		for (var i = 0; i < 7; i++) {
			this.segments[i] = Core.atlas.find(this.name + "-" + i);
		}
	}
});

disp.config(java.lang.Integer, (build, bits) => {
	build.drawx(false, bits);
});

disp.buildType = () => extend(Building, {
	draw() {
		this.super$draw();
		if (!this.bits || this.power.status < 0.01) return;

		Draw.alpha(this.power.status);
		for (var i in disp.segments) {
			if ((this.bits & (1 << i)) != 0) {
				Draw.rect(disp.segments[i], this.x, this.y);
			}
		}
		Draw.reset();
	},

	drawx(char, value) {
		this.bits = char ? getbits(value) : (typeof(value) == "number" ? (value & mask) : 0);
	},

	read(read, version) {
		this.super$read(read, version);
		this.bits = read.b() & mask;
	},
	write(write) {
		this.super$write(write);
		write.b(this.bits);
	},

	config() {
		return new java.lang.Integer(this.bits);
	},

	bits: 0
});
