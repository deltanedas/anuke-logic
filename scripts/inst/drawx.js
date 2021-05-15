// Interacts with 7seg-display and char-display
// drawx char requires at least T2 logic processor.

const DrawxI = {
	_(builder, char, display, value) {
		this.char = char;
		this.display = builder.var(display);
		this.value = builder.var(value);

		this.proc = builder.var("@this");
	},

	run(vm) {
		// Require T2+ processor to compile char instruction.
		if (this.char && vm.building(this.proc).block.instructionsPerTick < Blocks.logicProcessor.instructionsPerTick) {
			return;
		}

		const display = vm.building(this.display);
		// Basically an interface
		if (!display || typeof(display.drawx) != "function") return;
		if (display.team != vm.team || !vm.linkIds.contains(display.id)) return;

		const value = vm[this.char ? "obj" : "num"](this.value);
		if (this.char) {
			if (typeof(value) != "string") return;
			value = value.substr(0, 1);
		}

		display.drawx(this.char, value);
	}
};

const DrawxStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(DrawxStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.char = words[1] == "char";
		this.display = words[2] || "";
		this.value = words[3] || "";
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(DrawxI));
		inst._(h, this.char, this.display, this.value);
		return inst;
	},

	buildt(table) {
		const add = name => {
			table.add(name).left().marginLeft(10);
			this.field(table, this[name], text => {this[name] = text}).width(150);
		};

		add("display");
		var toggle;

		toggle = table.button(this.char ? "char" : "num", Styles.logict, () => {
			this.char = !this.char;
			toggle.getLabel().text = this.char ? "char" : "num";
		}).padLeft(10).padRight(10).width(60).left().color(table.color).get();
		this.row(table);

		add("value");
	},

	write(b) {
		b.append("drawx ");
		b.append(this.char ? "char " : "num ");

		b.append(this.display);
		b.append(" ");
		b.append(this.value);
	},

	name: () => "DrawX",
	color: () => Pal.logicBlocks
};

global.anuke.register("drawx", DrawxStatement, [
	"drawx",
	"char",
	"display1",
	'"h"'
]);

module.exports = DrawxStatement;
