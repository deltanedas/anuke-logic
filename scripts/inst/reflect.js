// "reflect" instruction provides the means to get/set variables from a string
// Completely removes the need for memory, requires T3+ processor.

// reflect get var "myvar" == set var myvar
// reflect set "myvar" var == set myvar var

const ReflectI = {
	_(builder, set, string, value) {
		this.builder = builder;
		this.set = set;
		this.string = builder.var(string);
		this.value = builder.var(value);
		this.proc = builder.var("@this");
	},

	run(vm) {
		// Require T3+ processor
		if (vm.building(this.proc).block.instructionsPerTick < Blocks.hyperProcessor.instructionsPerTick) {
			return;
		}

		const string = vm.obj(this.string);
		if (typeof(string) != "string") return;

		const index = this.getIndex(vm, string);
		if (index == -1) return;

		if (this.set) {
			const value = vm.vars[this.value];
			vm["set" + (value.isobj ? "obj" : "num")](index, value.isobj ? value.objval : value.numval);
			return;
		}

		const value = vm.vars[index];
		vm["set" + (value.isobj ? "obj" : "num")](this.value, value.isobj ? value.objval : value.numval);
	},

	getIndex(vm, str) {
		// see LAssembler#var
		str = str.replace(/ /g, "_");

		const vars = this.builder.vars;
		if (vars.containsKey(str)) {
			return vars.get(str).id;
		}

		// Add the new variable to the map
		const index = vm.vars.length;
		vars.put(str, new LAssembler.BVar(index));

		// Add it to the executor's variables array
		const newVars = [];
		for (var i = 0; i < index; i++) {
			newVars[i] = vm.vars[i];
		}
		newVars[index] = new LExecutor.Var(str);

		vm.vars = newVars;
		return index;
	}
};

const ReflectStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(ReflectStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.set = words[1] == "set";
		this.string = words[2] || "";
		this.value = words[3] || "";
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(ReflectI));
		inst._(h, this.set, this.string, this.value);
		return inst;
	},

	buildt(table) {
		const add = name => {
			this.field(table, this[name], text => {this[name] = text});
		};

		add("string");

		table.button(this.set ? "<-" : "->", Styles.logict, () => {
			this.set = !this.set;
			table.clear();
			this.buildt(table);
		}).padLeft(20).padRight(20).width(40).color(table.color);

		add("value");
	},

	write(b) {
		b.append("reflect ");
		b.append(this.set ? "set " : "get ");

		b.append(this.string);
		b.append(" ");
		b.append(this.value);
	},

	name: () => "Reflect",
	category: () => LCategory.io
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("reflect", func(ReflectStatement.new));

LogicIO.allStatements.add(prov(() => ReflectStatement.new([
	"reflect",
	"get",
	'"var_name"',
	"value"
])));
