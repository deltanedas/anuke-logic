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

		const display = vm.obj(this.display);
		// Basically an interface
		if (!display || typeof(display.drawx) != "function") return;

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
			table.add(name + " ");
			this.field(table, this[name], text => {this[name] = text});
		};

		add("display");

		var toggle;
		toggle = table.button(this.char ? "char" : "num", Styles.logict, () => {
			this.char = !this.char;
			toggle.getLabel().text = this.char ? "char" : "num";
		}).padLeft(20).padRight(20).width(50).color(table.color).get();

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
	color: () => Pal.logicOperations
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("drawx", func(DrawxStatement.new));

LogicIO.allStatements.add(prov(() => DrawxStatement.new([
	"drawx",
	"char",
	"display1",
	'"h"'
])));

module.exports = DrawxStatement;
