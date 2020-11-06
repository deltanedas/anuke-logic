const disp = extendContent(Block, "char-display", {
	invisible: c => c == ' ' || c == '\n' || c == '\r'
});

disp.config(java.lang.String, (build, char) => {
	build.drawx(true, char);
});

const side = (64 - 28) / 4;

disp.buildType = () => extend(Building, {
	draw() {
		this.super$draw();
		// add power check if anuke does
		if (/*this.power.status < 0.01 ||*/ disp.invisible(this.char)) return;

		const ratio = this.region.width / this.region.height;
//		Draw.alpha(this.power.status)
		Draw.rect(this.region, this.x, this.y, Math.min(side, side * ratio), side);
//		Draw.reset();
	},

	created() {
		this.super$created();
		this.recache();
	},

	recache() {
		const glyph = Fonts.def.data.getGlyph(this.char);
		if (!glyph) {
			this.char = '?';
			return this.recache();
		}

		// TODO: properly get glyph page, this is a hack
		this.region = new TextureRegion(Fonts.def.region.texture,
			glyph.u, glyph.v2, glyph.u2, glyph.v);
	},

	senseObject(type) {
		if (type == LAccess.config) {
			return this.char.charCodeAt(0);
		}
		return this.super$senseObject(type);
	},

	config() {
		return new java.lang.String(this.char);
	},
	drawx(char, value) {
		try {
			char = char ? value.substr(0, 1) : new java.lang.Character(value);
		} catch (e) {
			char = " ";
		}

		if (char != this.char) {
			this.char = char;
			this.recache();
		}
	},

	read(read, version) {
		this.super$read(read, version);
		this.drawx(true, read.str());
		this.recache();
	},
	write(write) {
		this.super$write(write);
		write.str(this.char);
	},

	region: null,
	char: 'h'
});
