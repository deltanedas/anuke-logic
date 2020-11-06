// All result strings are truncated to this length
const maxLength = 256;

const ops = {
	len: {
		run: string => string.length
	},

	// result = string.substr(start, end)
	sub: {
		args: {start: "num", length: "num"},

		run(string, args) {
			if (args.start < 0) {
				args.start += string.length;
			}
			if (args.length < 1) {
				args.length += string.length;
			}

			return string.substr(args.start, args.length);
		}
	},

	// result = string + add
	add: {
		args: {add: "obj"},

		run: (string, args) => string + args.add
	},

	char: {
		args: {index: "num"},

		run(string, args) {
			if (args.index < 0) {
				args.index += string.length;
			}

			const code = string.charCodeAt(args.index);
			return isNaN(code) ? -1 : code;
		}
	},

	// result = string + Character(char)
	push: {
		args: {char: "num"},

		run(string, args) {
			// If pushing DEL, pop a char
			if (args.char == 0x7f) {
				return string.slice(0, -1);
			}

			try {
				return string + java.lang.Character(args.char);
			} catch (e) {
				return string;
			}
		}
	}
};

const StringI = {
	_(builder, op, result, string, args) {
		this.op = op;
		this.args = {};

		this.residx = builder.var(result);
		this.stridx = builder.var(string);

		const opargs = (ops[op] || {}).args;
		if (!opargs) return;

		this.indices = {};
		const argnames = Object.keys(opargs);
		for (var i in argnames) {
			this.indices[argnames[i]] = builder.var(args[i]);
		}
	},

	run(vm) {
		const op = ops[this.op];
		if (!op) return;

		this.vm = vm;
		this.string = "" + vm.obj(this.stridx);

		for (var arg in op.args || {}) {
			this.args[arg] = vm[op.args[arg]](this.indices[arg]);
		}

		this.setResult(op.run(this.string, this.args, this));
	},

	setResult(str) {
		if (typeof(str) == "string" && str.length > maxLength) {
			str = str.substr(0, maxLength);
		}

		this.vm["set" + ((typeof(str) == "number") ? "num" : "obj")](this.residx, str);
	}
};

const StringStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(StringStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.op = words[1];
		this.result = words[2];
		this.string = words[3];

		this.args = [];
		for (var i = 4; i < 6; i++) {
			this.args[i - 4] = words[i];
		}
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(StringI));
		inst._(h, this.op, this.result, this.string, this.args);
		return inst;
	},

	buildt(table) {
		const add = name => {
			this.field(table, this[name], res => {this[name] = res});
		};

		table.add("set ");
		add("result");
		table.add(" to ");
		this.row(table);

		add("string");

		/* dropdown for op */
		var opb = table.button(this.op, Styles.logict, () => {
			this.showSelectTable(opb, (t, hide) => {
				for (var op in ops) {
					this.setter(table, t, op, hide);
				}
			});
		}).width(100).color(table.color).get();

		if (!ops[this.op]) return;

		/* Op-specific args */
		const argnames = Object.keys(ops[this.op].args || {});
		for (var i in argnames) {
			const idx = i;
			if (this.args[i] === undefined) {
				this.args[i] = argnames[i];
			}

			this.field(table, this.args[i], arg => {this.args[idx] = arg});

			if ((i % 2) == 1) this.row(table);
		}
	},

	setter(root, table, op, hide) {
		table.button(op, () => {
			this.op = op;
			root.clearChildren();
			hide.run();
			this.buildt(root);
		}).row();
	},

	write(b) {
		b.append("string ");
		b.append(this.op + " ");
		b.append(this.result + " ");
		b.append(this.string + "");

		for (var i of this.args) {
			if (i !== undefined && i != "undefined") {
				b.append(" " + i);
			}
		}
	},

	name: () => "String",
	category: () => LCategory.operations
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("string", func(StringStatement.new));

LogicIO.allStatements.add(prov(() => StringStatement.new([
	"string",
	"add",
	"result",
	'"frog"',
	'" cat"'
])));
