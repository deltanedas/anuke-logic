const disp = extendContent(Block, "char-display", {
	invisible: c => c == ' ' || c == '\n' || c == '\r'
});

disp.config(java.lang.Character, (build, char) => {
	build.drawx(true, char);
});

const side = (64 - 28) / 4;

disp.buildType = () => extend(Building, {
	draw() {
		this.super$draw();
		if (this.power.status < 0.01 || disp.invisible(this.char)) return;

		const ratio = this.region.height / this.region.width;
		Draw.alpha(this.power.status)
		Draw.rect(this.region, this.x, this.y, side / ratio, side);
		Draw.reset();
	},

	created() {
		this.super$created();
		this.recache();
	},

	recache() {
		const glyph = Fonts.def.data.getGlyph(this.char);
		if (!glyph) {
			this.char = '?';
			return this.rechache();
		}

		// TODO: properly get glyph page
		this.region = new TextureRegion(Fonts.def.region.texture,
			glyph.u, glyph.v2, glyph.u2, glyph.v);
	},

	config() {
		return this.char;
	},
	drawx(char, value) {
		char = char ? value.substr(0, 1) : new java.lang.Character(value);
		if (char != this.char) {
			this.char = char;
			this.recache();
		}
	},

	read(read, version) {
		this.super$read(read, version);
		this.drawx(false, read.i());
		this.recache();
	},
	write(write) {
		this.super$write(write);
		write.i(this.char.charCodeAt(0));
	},

	region: null,
	char: 'h'
});
