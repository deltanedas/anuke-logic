// "rotate" instruction allows rotating blocks, including routers.

/* Relative rotating:
   rotate conveyor1 by 1
   Absolute rotation:
   rotate router1 to 2 */

const RotateI = {
	_(builder, block, relative, value) {
		this.builder = builder;
		this.block = builder.var(block);
		this.relative = relative;
		this.value = builder.var(value);
	},

	run(vm) {
		const block = vm.building(this.block);
		if (!block || block.team != vm.team || !vm.linkIds.contains(block.id)) return;

		this[this.relative ? "setRel" : "setAbs"](block, vm.num(this.value));
	},

	setAbs(block, to) {
		// Not rotated
		if (block.rotation == (to % 4)) return;

		block.rotation = to % 4;
		block.updateProximity();
		block.noSleep();
	},

	setRel(block, by) {
		this.setAbs(block, block.rotation + by);
	}
};

const RotateStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(RotateStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.block = words[1] || "block1";
		this.relative = words[2] == "by";
		this.value = words[3] || "1";
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(RotateI));
		inst._(h, this.block, this.relative, this.value);
		return inst;
	},

	buildt(table) {
		const add = name => {
			this.field(table, this[name], text => {this[name] = text});
		};

		add("block");

		table.button(this.relative ? "by" : "to", Styles.logict, () => {
			this.relative = !this.relative;
			table.clear();
			this.buildt(table);
		}).padLeft(20).padRight(20).width(40).color(table.color);

		add("value");
	},

	write(b) {
		b.append("rotate ");

		b.append(this.block);
		b.append(" ");
		b.append(this.relative ? "by " : "to ");
		b.append(this.value);
	},

	name: () => "Rotate",
	color: () => Pal.logicBlocks
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("rotate", func(RotateStatement.new));

LogicIO.allStatements.add(prov(() => RotateStatement.new([
	"rotate",
	"block1",
	"by",
	"1"
])));

module.exports = RotateStatement;
