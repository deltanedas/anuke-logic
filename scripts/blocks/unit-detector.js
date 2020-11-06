const det = extendContent(Block, "unit-detector", {
	setStats() {
		this.super$setStats();
		this.stats.add(Stat.range, this.max, StatUnit.blocks);
	},

	max: 10
});

det.config(java.lang.Double, (build, dist) => {
	build.setem(dist);
});

det.buildType = () => new JavaAdapter(Building, Ranged, {
	buildConfiguration(table) {
		table.button(Icon.upOpen, () => {
			this.configure(this.distance + Vars.tilesize);
		});
		table.row();
		table.button(Icon.downOpen, () => {
			this.configure(this.distance - Vars.tilesize);
		});
	},

	drawSelect() {
		Lines.stroke(1);
		Draw.color(Color.coral);
		Drawf.circles(this.x, this.y, this.distance);
		Draw.reset();
	},

	drawConfigure() {
		this.drawSelect();
	},

	// Ranged implementation
	range() {
		return this.distance;
	},

	config() {
		return this.distance;
	},
	setem(to) {
		to = Mathf.clamp(Vars.tilesize, Vars.tilesize * det.max, to);
		this.distance = to;
	},

	read(read, version) {
		this.super$read(read, version);
		this.setem(read.b());
	},

	write(write) {
		this.super$write();
		write.b(this.distance);
	},

	distance: Vars.tilesize
});

module.exports = det;
